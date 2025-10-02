const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authenticateUser");

const {
    createNotification,
    getNotifications,
    markAllRead,
    markOneRead,
    deleteNotification
} = require("../controllers/notificationController");

router.put("/", authMiddleware, createNotification);
router.get("/", authMiddleware, getNotifications);
router.put("/mark-read", authMiddleware, markAllRead);
router.put("/:id/mark-read", authMiddleware, markOneRead);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
