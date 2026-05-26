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
const { validateRegister, validateLogin } = require("../middleware/validator");

const router = express.Router();

router.post("/register", validateRegister, registerUser);

router.post("/login", validateLogin, loginUser);

router.delete("/delete", authenticateUser, deleteUser);

router.get("/get-profile", authenticateUser, getUser);

router.put("/update-profile", authenticateUser, updateProfile);

router.put("/change-password", authenticateUser, changePassword);

module.exports = router;
