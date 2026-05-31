const Transaction = require("../models/Transaction");
const RecurringTransaction = require("../models/recurringTransactions");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/encryption");
const asyncHandler = require("../middleware/asyncHandler");

function getNextDate(currentDate, frequency) {
  const nextDate = new Date(currentDate);
  switch (frequency) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
}

const createTransaction = asyncHandler(async (req, res) => {
  const { source, category, amount, type, date, notes, recurring, frequency } =
    req.body;

  if (!amount || !source || !category || !type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const numericAmount = parseFloat(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const encryptedAmount = encrypt(amount.toString());

  let nextDate = null;

  if (recurring && frequency) {
    nextDate = new Date(date);
    switch (frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ message: "Invalid frequency" });
    }
  }

  const transaction = await Transaction.create({
    userId: req.user.userId,
    source,
    category,
    amount: encryptedAmount,
    type,
    date,
    recurring,
    frequency: recurring ? frequency : null,
    nextDate,
    notes,
  });

  const user = await User.findById(req.user.userId);
  const numericValue = numericAmount;

  if (type === "income") {
    user.balance += numericValue;
    user.totalIncome += numericValue;
  } else {
    user.balance -= numericValue;
    user.totalExpenses += numericValue;
  }

  await user.save();

  res.status(201).json(transaction);
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.userId });
  const decryptedTransactions = transactions.map((transaction) => {
    return {
      ...transaction._doc,
      amount: decrypt(transaction.amount),
    };
  });
  res.json(decryptedTransactions);
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  // Decrypt the amount before sending it back
  const decryptedTransaction = {
    ...transaction._doc,
    amount: decrypt(transaction.amount),
  };

  res.status(200).json(decryptedTransaction);
});

const updateTransaction = asyncHandler(async (req, res) => {
  // Find the transaction to update
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  // Validate the new amount up front so a bad value can't corrupt the balance
  if (req.body.amount !== undefined) {
    const parsed = parseFloat(req.body.amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
  }

  // Update user balance and totals
  const user = await User.findById(req.user.userId);

  const oldAmount = parseFloat(decrypt(transaction.amount));
  if (!Number.isFinite(oldAmount)) {
    return res
      .status(500)
      .json({ message: "Stored amount could not be read" });
  }
  const oldType = transaction.type;

  if (oldType === "income") {
    user.balance -= oldAmount;
    user.totalIncome -= oldAmount;
  } else {
    user.balance += oldAmount;
    user.totalExpenses -= oldAmount;
  }

  // Calculate new amounts and update user totals
  const newAmount =
    req.body.amount !== undefined ? parseFloat(req.body.amount) : oldAmount;
  const newType = req.body.type || oldType;

  if (newType === "income") {
    user.balance += newAmount;
    user.totalIncome += newAmount;
  } else {
    user.balance -= newAmount;
    user.totalExpenses += newAmount;
  }

  // Update the transaction with new values
  transaction.source = req.body.source || transaction.source;
  transaction.category = req.body.category || transaction.category;
  if (req.body.amount !== undefined) {
    transaction.amount = encrypt(newAmount.toString());
  }
  transaction.type = req.body.type || transaction.type;
  transaction.date = req.body.date || transaction.date;
  transaction.notes =
    req.body.notes !== undefined ? req.body.notes : transaction.notes;

  // Save the updated transaction and user
  await transaction.save();
  await user.save();

  res.status(200).json(transaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const user = await User.findById(req.user.userId);
  const amount = parseFloat(decrypt(transaction.amount));

  if (transaction.type === "income") {
    user.balance -= amount;
    user.totalIncome -= amount;
  } else {
    user.balance += amount;
    user.totalExpenses -= amount;
  }

  await user.save();

  const recurrings = await RecurringTransaction.find({
    "history.transactionId": transaction._id,
  });

  for (const recurring of recurrings) {
    recurring.history = recurring.history.filter(
      (h) =>
        !h.transactionId ||
        h.transactionId.toString() !== transaction._id.toString(),
    );

    const snoozedEntries = recurring.history
      .filter((h) => h.status === "snoozed" && h.snoozedUntil)
      .sort((a, b) => new Date(b.snoozedUntil) - new Date(a.snoozedUntil));

    if (snoozedEntries.length > 0) {
      recurring.nextDate = new Date(snoozedEntries[0].snoozedUntil);
    } else if (recurring.history.length > 0) {
      const remainingSorted = recurring.history
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const last = remainingSorted[0];

      recurring.nextDate = getNextDate(
        new Date(last.date),
        recurring.frequency,
      );
    } else {
      recurring.nextDate = getNextDate(
        new Date(recurring.startDate),
        recurring.frequency,
      );
    }
    await recurring.save();
  }

  await transaction.deleteOne();

  res.json({ message: "Transaction Deleted" });
});

const getMonthlySummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const transactions = await Transaction.find({
    userId: req.user.userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    const amount = parseFloat(decrypt(transaction.amount));
    if (transaction.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
  });

  res.json({
    month: now.toLocaleString("default", { month: "long" }),
    year: now.getFullYear(),
    totalIncome,
    totalExpenses,
    net: totalIncome - totalExpenses,
  });
});

const deleteAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.userId });

  if (transactions.length === 0) {
    return res.status(404).json({ message: "No transactions found" });
  }

  await Transaction.deleteMany({ userId: req.user.userId });

  const user = await User.findById(req.user.userId);
  user.balance = 0;
  user.totalIncome = 0;
  user.totalExpenses = 0;
  await user.save();

  res.json({ message: "All transactions deleted" });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  deleteAllTransactions,
};
