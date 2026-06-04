const mongoose = require("mongoose");

// A "wallet" is a money source the user tracks (e.g. HDFC, Cash, Paytm).
// Named Wallet (not Account) to avoid confusion with the user's login account.
const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

walletSchema.index({ userId: 1, name: 1 }, { unique: true });

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
