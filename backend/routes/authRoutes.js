const express = require("express");
const {
  registerUser,
  loginUser,
  deleteUser,
  getUser,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const authenticateUser = require("../middleware/authenticateUser");
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
} = require("../middleware/validator");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Stricter limiter on auth endpoints to deter brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validateRegister, registerUser);

router.post("/login", authLimiter, validateLogin, loginUser);

router.delete("/delete", authenticateUser, deleteUser);

router.get("/get-profile", authenticateUser, getUser);

router.put("/update-profile", authenticateUser, updateProfile);

router.put(
  "/change-password",
  authenticateUser,
  validateChangePassword,
  changePassword,
);

module.exports = router;
