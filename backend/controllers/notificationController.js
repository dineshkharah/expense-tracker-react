const User = require("../models/User");

const createNotification = async (req, res) => {
  try {
    const { message, type, recurringId, transactionId } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notifications.push({
      message,
      type: type || "system",
      recurringId: recurringId || null,
      transactionId: transactionId || null,
    });

    await user.save();
    res.status(201).json({
      message: "Notification created",
      notifications: user.notifications,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("notifications");
    res.json(user.notifications.sort((a, b) => b.date - a.date));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const markAllRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.notifications.forEach((n) => (n.read = true));
    await user.save();
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

const markOneRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await user.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    user.notifications.pull({ _id: req.params.id });
    await user.save();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "notificationPreferences",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.notificationPreferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { recurringReminders, paymentDueAlerts } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (recurringReminders !== undefined)
      user.notificationPreferences.recurringReminders = recurringReminders;
    if (paymentDueAlerts !== undefined)
      user.notificationPreferences.paymentDueAlerts = paymentDueAlerts;

    await user.save();
    res.json(user.notificationPreferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
};
