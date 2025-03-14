import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  deleteImgFromChat,
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/conversations", isAuth, getConversations);
router.get("/:otherUserId", isAuth, getMessages);
router.post("/", isAuth, sendMessage);
router.delete("/delete-image", isAuth, deleteImgFromChat);

export default router;
