const express = require("express");
const {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
} = require("../controllers/walletController");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();

router.post("/", authenticateUser, createWallet);

router.get("/", authenticateUser, getWallets);

router.put("/:id", authenticateUser, updateWallet);

router.delete("/:id", authenticateUser, deleteWallet);

module.exports = router;
