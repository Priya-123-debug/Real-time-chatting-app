import Message from "../models/Message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import ChatClear from "../models/ChatClear.model.js";

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

    const message = await Message.create({ senderId, receiverId, text });

    // emit to receiver in real time via socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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