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
const userSocketMap = {}; // hashmap
io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  const userId = socket.handshake.query.userId; //from socket context frontend
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

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
  socket.on("likePost", async ({ postId, likedBy }) => {
    try {
      const post = await Post.findById(postId);
      if (!post) return console.log("Post not found!");

      // Get the post owner ID
      const postOwnerId = post.userId; // assuming userId is the post owner's ID in the Post model

      // Check if user is already liking the post
      const userLikedPost = post.likes.includes(likedBy);

      if (userLikedPost) {
        // User unlikes the post
        await Post.updateOne({ _id: postId }, { $pull: { likes: likedBy } });
      } else {
        // User likes the post
        await Post.updateOne({ _id: postId }, { $push: { likes: likedBy } });
      }

      // Notify the post owner in real-time (send notification to the post owner)
      const postOwnerSocketId = userSocketMap[postOwnerId];
      if (postOwnerSocketId) {
        io.to(postOwnerSocketId).emit("postLiked", {
          postId,
          likedBy,
          isLiked: !userLikedPost, // Send whether the post is now liked or unliked
        });
      }
    } catch (error) {
      console.log("Error in likePost:", error.message);
    }
  });

  // **Comment on Post Event**
  socket.on("commentPost", async ({ postId, comment, commentedBy }) => {
    try {
      const post = await Post.findById(postId);
      if (!post) return console.log("Post not found!");

      // Add the comment to the post
      const newComment = {
        userId: commentedBy,
        text: comment,
        commentAt: new Date(),
      };
      await Post.updateOne(
        { _id: postId },
        { $push: { comments: newComment } }
      );

      // Get the post owner ID
      const postOwnerId = post.userId; // assuming userId is the post owner's ID

      // Notify the post owner in real-time about the new comment
      const postOwnerSocketId = userSocketMap[postOwnerId];
      if (postOwnerSocketId) {
        io.to(postOwnerSocketId).emit("postCommented", {
          postId,
          newComment,
        });
      }
    } catch (error) {
      console.log("Error in commentPost:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
