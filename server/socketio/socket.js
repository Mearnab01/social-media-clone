import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../model/message.model.js";
import Conversation from "../model/conversation.model.js";
import Post from "../model/post.model.js";
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.0.177:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {};
io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
  }
  if (userId != "undefined") {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // **markMsgAsRead**
  socket.on("markMsgAsRead", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messageSeen", { conversationId });
    } catch (error) {
      console.log(error, "from socket.js");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
