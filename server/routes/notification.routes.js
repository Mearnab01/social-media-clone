import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.put("/read", isAuth, markAsRead);
router.put("/all-read", isAuth, markAllAsRead);
router.delete("/delete", isAuth, deleteNotification);

export default router;
