import Notification from "../model/notification.model.js";

// Create a notification
export const createNotification = async (
  type,
  fromUser,
  toUser,
  message,
  postId = null
) => {
  try {
    if (fromUser.toString() === toUser.toString()) return; // don't notify self

    const notification = new Notification({
      type,
      fromUser,
      toUser,
      message,
      postId,
    });

    await notification.save();
  } catch (error) {
    console.log("Error creating notification:", error.message);
  }
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ toUser: userId })
      .populate("fromUser", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.body;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { toUser: userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
