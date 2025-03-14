import express from "express";
import {
  createPost,
  deleteComment,
  deletePost,
  getFeedPosts,
  getPost,
  getUserPosts,
  likeDislikePost,
  replyToUser,
} from "../controllers/post.controller.js";
import isAuth from "../middlewares/isAuth.js";
const router = express.Router();

router.get("/get-post/:username", getUserPosts);
router.get("/feed", isAuth, getFeedPosts);
router.get("/:id", getPost);
router.post("/create", isAuth, createPost);
router.delete("/delete-post/:id", isAuth, deletePost);
router.delete("/delete-comment/:commentId", isAuth, deleteComment);
router.put("/like-dislike/:id", isAuth, likeDislikePost);
router.put("/post-reply/:id", isAuth, replyToUser);
export default router;
