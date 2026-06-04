const Wallet = require("../models/Wallet");
const asyncHandler = require("../middleware/asyncHandler");

const createWallet = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Wallet name is required" });
  }

  const existing = await Wallet.findOne({
    userId: req.user.userId,
    name: name.trim(),
  });
  if (existing) {
    return res.status(400).json({ message: "Wallet already exists" });
  }

  const wallet = await Wallet.create({
    userId: req.user.userId,
    name: name.trim(),
  });
  res.status(201).json(wallet);
});

const getWallets = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find({ userId: req.user.userId });
  res.status(200).json(wallets);
});

const updateWallet = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Wallet name is required" });
  }

  const wallet = await Wallet.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { name: name.trim() },
    { new: true },
  );
  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }
  res.status(200).json(wallet);
});

const deleteWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });
  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }
  res.status(200).json({ message: "Wallet deleted successfully" });
});

module.exports = {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
};
