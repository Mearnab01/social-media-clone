import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/conversations", isAuth, getConversations);
router.get("/:otherUserId", isAuth, getMessages);
router.post("/", isAuth, sendMessage);

export default router;
