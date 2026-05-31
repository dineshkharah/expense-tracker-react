const Savings = require("../models/Savings");
const { encrypt, decrypt } = require("../utils/encryption");
const asyncHandler = require("../middleware/asyncHandler");

const createSavingsGoal = asyncHandler(async (req, res) => {
  const { goalName, targetAmount, savedAmount, deadline, progress, notes } =
    req.body;

  const userId = req.user.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }

  if (!goalName || !targetAmount || !deadline || !progress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const encryptedTargetAmount = encrypt(targetAmount);
  const encryptedSavedAmount = encrypt(savedAmount ? savedAmount : "0");
  const encryptedProgress = encrypt(progress);

  const newSaving = new Savings({
    userId,
    goalName,
    targetAmount: encryptedTargetAmount,
    savedAmount: encryptedSavedAmount,
    deadline,
    progress: encryptedProgress,
    notes,
  });

  await newSaving.save();
  res.status(201).json({ message: "Saving goal added successfully" });
});

const getAllSavingsGoals = asyncHandler(async (req, res) => {
  const savingsGoals = await Savings.find({ userId: req.user.userId });
  const decryptedSavings = savingsGoals.map((goal) => {
    return {
      ...goal._doc,
      targetAmount: decrypt(goal.targetAmount),
      savedAmount: decrypt(goal.savedAmount),
      progress: decrypt(goal.progress),
    };
  });

  res.status(200).json(decryptedSavings);
});

const getSavingGoalById = asyncHandler(async (req, res) => {
  const savingsGoal = await Savings.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!savingsGoal) {
    return res.status(404).json({ message: "Saving goal not found" });
  }

  savingsGoal.targetAmount = decrypt(savingsGoal.targetAmount);
  savingsGoal.savedAmount = decrypt(savingsGoal.savedAmount);
  savingsGoal.progress = decrypt(savingsGoal.progress);

  res.status(200).json(savingsGoal);
});

const updateSavingGoal = asyncHandler(async (req, res) => {
  const { goalName, targetAmount, savedAmount, deadline, progress, notes } =
    req.body;

  const savingsGoal = await Savings.findOne({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!savingsGoal) {
    return res.status(404).json({ message: "Saving goal not found" });
  }

  if (targetAmount) {
    savingsGoal.targetAmount = encrypt(targetAmount);
  }

  if (savedAmount) {
    savingsGoal.savedAmount = encrypt(savedAmount);
  }

  if (progress) {
    savingsGoal.progress = encrypt(progress.toString());
  }

  savingsGoal.goalName = goalName || savingsGoal.goalName;
  savingsGoal.deadline = deadline || savingsGoal.deadline;
  savingsGoal.notes = notes || savingsGoal.notes;

  await savingsGoal.save();
  res.status(200).json({ message: "Saving goal updated successfully" });
});

const deleteSavingGoal = asyncHandler(async (req, res) => {
  const savingsGoal = await Savings.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!savingsGoal) {
    return res.status(404).json({ message: "Saving goal not found" });
  }

  res.status(200).json({ message: "Saving goal deleted successfully" });
});

module.exports = {
  createSavingsGoal,
  getAllSavingsGoals,
  getSavingGoalById,
  updateSavingGoal,
  deleteSavingGoal,
};
