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

// Returns one socket id (useful for direct messaging)
export const getReceiverSocketId = (userId) => {
  const sockets = userSocketMap.get(userId);

  if (!sockets || sockets.size === 0) {
    return null;
  }

  return [...sockets][0];
};

// Returns all online users
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

    // Add this socket to the user's active sockets
    userSocketMap.get(userId).add(socket.id);

    console.log(userSocketMap);

    // Notify everyone
    io.emit("getOnlineUsers", getOnlineUsers());
  }

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);

    if (!userId) return;

    const sockets = userSocketMap.get(userId);

    if (!sockets) return;

    // Remove only this socket
    sockets.delete(socket.id);

    // If no active sockets remain, remove the user
    if (sockets.size === 0) {
      userSocketMap.delete(userId);

      // Later we'll also update lastSeen in MongoDB here
    }

    console.log(userSocketMap);

    // Notify everyone
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

export { app, io, server };