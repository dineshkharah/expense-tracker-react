const Savings = require('../models/Savings');

const { encrypt, decrypt } = require('../utils/encryption');

const createSavingsGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, savedAmount, deadline, progress, notes } = req.body;

        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found' });
        }

        if (!goalName || !targetAmount || !deadline || !progress) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedTargetAmount = encrypt(targetAmount);
        const encryptedSavedAmount = encrypt(savedAmount ? savedAmount : '0');
        const encryptedProgress = encrypt(progress);

        const newSaving = new Savings({
            userId,
            goalName,
            targetAmount: encryptedTargetAmount,
            savedAmount: encryptedSavedAmount,
            deadline,
            progress: encryptedProgress,
            notes
        });

        await newSaving.save();
        res.status(201).json({ message: 'Saving goal added successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllSavingsGoals = async (req, res) => {
    try {
        const savingsGoals = await Savings.find({ userId: req.user.userId });
        const decryptedSavings = savingsGoals.map(goal => {
            return {
                ...goal._doc,
                targetAmount: decrypt(goal.targetAmount),
                savedAmount: decrypt(goal.savedAmount),
                progress: decrypt(goal.progress)
            }
        });

        res.status(200).json(decryptedSavings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getSavingGoalById = async (req, res) => {
    try {
        const savingsGoal = await Savings.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!savingsGoal) {
            return res.status(404).json({ message: 'Saving goal not found' });
        }

        savingsGoal.targetAmount = decrypt(savingsGoal.targetAmount);
        savingsGoal.savedAmount = decrypt(savingsGoal.savedAmount);
        savingsGoal.progress = decrypt(savingsGoal.progress);

        res.status(200).json(savingsGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const updateSavingGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, savedAmount, deadline, progress, notes } = req.body;

        const savingsGoal = await Savings.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!savingsGoal) {
            return res.status(404).json({ message: 'Saving goal not found' });
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
        res.status(200).json({ message: 'Saving goal updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const deleteSavingGoal = async (req, res) => {
    try {
        const savingsGoal = await Savings.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!savingsGoal) {
            return res.status(404).json({ message: 'Saving goal not found' });
        }

        res.status(200).json({ message: 'Saving goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createSavingsGoal,
    getAllSavingsGoals,
    getSavingGoalById,
    updateSavingGoal,
    deleteSavingGoal
};
