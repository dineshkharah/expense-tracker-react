const RecurringExpense = require('../models/RecurringExpense');

const { encrypt, decrypt } = require('../utils/encryption');

const createRecurringExpense = async (req, res) => {
    try {
        const { name, amount, dueDate, frequency, autoPay, notificationsEnabled, notes } = req.body;

        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found' });
        }

        if (!name || !amount || !dueDate || !frequency || autoPay === undefined || notificationsEnabled === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(amount);

        const newRecurringExpense = new RecurringExpense({
            userId,
            name,
            amount: encryptedAmount,
            dueDate,
            frequency,
            autoPay,
            notificationsEnabled,
            notes
        });

        await newRecurringExpense.save();
        res.status(201).json({ message: 'Expense added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllRecurringExpenses = async (req, res) => {
    try {
        const recurringExpenses = await RecurringExpense.find({ userId: req.user.userId });
        const decryptedRecurringExpenses = recurringExpenses.map(expense => {
            return {
                ...expense._doc,
                amount: decrypt(expense.amount)
            }
        });

        res.status(200).json(decryptedRecurringExpenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getRecurringExpenseById = async (req, res) => {
    try {
        const recurringExpense = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!recurringExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        recurringExpense.amount = decrypt(recurringExpense.amount);

        res.json(recurringExpense);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const updateRecurringExpense = async (req, res) => {
    try {
        const { name, amount, dueDate, frequency, autoPay, notificationsEnabled, notes } = req.body;

        const recurringExpense = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!recurringExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (amount) {
            recurringExpense.amount = encrypt(amount);
        }

        recurringExpense.name = name || recurringExpense.name;
        recurringExpense.dueDate = dueDate || recurringExpense.dueDate;
        recurringExpense.frequency = frequency || recurringExpense.frequency;
        recurringExpense.autoPay = autoPay !== undefined ? autoPay : recurringExpense.autoPay;
        recurringExpense.notificationsEnabled = notificationsEnabled !== undefined ? notificationsEnabled : recurringExpense.notificationsEnabled;
        recurringExpense.notes = notes || recurringExpense.notes;


        await recurringExpense.save();
        res.json({ message: 'Expense updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteRecurringExpense = async (req, res) => {
    try {
        const recurringExpense = await RecurringExpense.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!recurringExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createRecurringExpense,
    getAllRecurringExpenses,
    getRecurringExpenseById,
    updateRecurringExpense,
    deleteRecurringExpense
};