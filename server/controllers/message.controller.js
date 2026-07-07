import Message from "../models/Message.model.js";

import { emitToUser } from "../socket/socket.js";
import ChatClear from "../models/ChatClear.model.js";
import {
 
  activeConversationMap,
} from "../socket/socket.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;   // the other user
    const myId = req.user._id;
    const clearInfo = await ChatClear.findOne({
  userId: myId,
  peerId: userId,
});
const query = {
  $or: [
    { senderId: myId, receiverId: userId },
    { senderId: userId, receiverId: myId },
  ],
  deletedFor: {
    $ne: myId,
  },
};
if (clearInfo) {
  query.createdAt = {
    $gt: clearInfo.clearedAt,
  };
}
const messages = await Message.find(query).sort({
  createdAt: 1,
});
    



    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// send a message
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

    let media = {};

    if (req.file) {
   
      const uploaded = await uploadToCloudinary(req.file);
     

      media = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        type: req.file.mimetype,
        originalName: req.file.originalname,
        size: req.file.size,
      };
    }

    const isSeen =
      activeConversationMap.get(receiverId)?.toString() ===
      senderId.toString();

    

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      media,
      seen: isSeen,
    });

    

    emitToUser(receiverId, "newMessage", message);

    if (isSeen) {
      emitToUser(senderId, "messagesSeen", {
        messageId: message._id,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};







export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    // Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Authorization
    const isParticipant =
      message.senderId.toString() === myId.toString() ||
      message.receiverId.toString() === myId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Delete for current user
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: {
        deletedFor: myId,
      },
    });

    return res.status(200).json({
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};


export const clearChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    await ChatClear.findOneAndUpdate(
      {
        userId: myId,
        peerId: userId,
      },
      {
        clearedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.json({
      message: "Chat cleared successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};


export const markMessagesSeen = async (req, res) => {
  try {
    const { userId } = req.params; // Alice
    const myId = req.user._id;     // Bob

    // Find unread messages
    const unreadMessages = await Message.find({
      senderId: userId,
      receiverId: myId,
      seen: false,
    }).select("_id");

    const messageIds = unreadMessages.map((msg) => msg._id);

    // Nothing to update
    if (messageIds.length === 0) {
      return res.status(200).json({
        message: "No unread messages.",
      });
    }

    // Mark all as seen
    await Message.updateMany(
      {
        _id: { $in: messageIds },
      },
      {
        $set: {
          seen: true,
        },
      }
    );

    // Notify Alice on all her devices
    emitToUser(userId, "messagesSeen", {
      messageIds,
    });

    return res.status(200).json({
      message: "Messages marked as seen.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};