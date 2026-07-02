import Message from "../models/Message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;   // the other user
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });   // oldest first

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