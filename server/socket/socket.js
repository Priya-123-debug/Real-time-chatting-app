import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// userId -> Set(socketIds)
const userSocketMap = new Map();

// Get all socket ids of a user
export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId) || new Set();
};

// Emit an event to every device of a user
export const emitToUser = (userId, event, data) => {
  const socketIds = getReceiverSocketIds(userId);

  for (const socketId of socketIds) {
    io.to(socketId).emit(event, data);
  }
};

// Online users
export const getOnlineUsers = () => {
  return [...userSocketMap.keys()];
};

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    // First connection of this user?
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }

    // Add current socket
    userSocketMap.get(userId).add(socket.id);

    console.log(userSocketMap);

    // Notify everyone
    io.emit("getOnlineUsers", getOnlineUsers());
  }

  // ==========================
  // Typing Indicator
  // ==========================

  socket.on("typingStart", ({ receiverId }) => {
    emitToUser(receiverId, "typingStart", {
      userId,
    });
  });

  socket.on("typingStop", ({ receiverId }) => {
    emitToUser(receiverId, "typingStop", {
      userId,
    });
  });

  // ==========================
  // Disconnect
  // ==========================

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);

    if (!userId) return;

    const sockets = userSocketMap.get(userId);

    if (!sockets) return;

    // Remove only this socket
    sockets.delete(socket.id);

    // Remove user if no devices remain
    if (sockets.size === 0) {
      userSocketMap.delete(userId);
    }

    console.log(userSocketMap);

    // Notify everyone
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

export { app, io, server };