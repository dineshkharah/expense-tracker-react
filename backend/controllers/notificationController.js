const { notification } = require("antd");
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
            transactionId: transactionId || null
        });

        await user.save();
        res.status(201).json({ message: "Notification created", notifications: user.notifications });

    } catch (error) {
        res.status(500).json({ message: "Failed to create notification" });
    }
}

const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("notifications");
        res.json(user.notifications.sort((a, b) => b.date - a.date));
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

const markAllRead = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.notifications.forEach((n) => (n.read = true));
        await user.save();
        res.json({ message: "Notifications marked as read" });
    } catch (err) {
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
    } catch (err) {
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

        notification.remove();
        await user.save();
        res.json({ message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete notification" });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAllRead,
    markOneRead,
    deleteNotification
};