import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  deleteMessageAndImage,
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/conversations", isAuth, getConversations);
router.get("/:otherUserId", isAuth, getMessages);
router.post("/", isAuth, sendMessage);
router.delete("/delete", isAuth, deleteMessageAndImage);

export default router;
