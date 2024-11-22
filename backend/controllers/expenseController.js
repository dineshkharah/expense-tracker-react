const Expense = require('../models/Expense');
const { encrypt, decrypt } = require('../utils/encryption');

const createExpense = async (req, res) => {
    const { personName, category, amount, type, notes } = req.body;
    try {
        console.log(req.body);

        if (!amount || !personName || !category || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(amount.toString());
        console.log("Encrypted amount: ", encryptedAmount);

        const expense = await Expense.create({
            userId: req.user.userId,
            personName,
            category,
            amount: encryptedAmount,
            type,
            notes,
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }

}

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.userId });
        const decryptedExpenses = expenses.map(expense => {
            console.log(expense._doc);
            return ({
                ...expense._doc,
                amount: decrypt(expense.amount),
            })

        });
        res.json(decryptedExpenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const updateExpense = async (req, res) => {
    const updateFields = {};

    if (req.body.personName) updateFields.personName = req.body.personName;
    if (req.body.category) updateFields.category = req.body.category;
    if (req.body.amount) updateFields.amount = encrypt(req.body.amount.toString());
    if (req.body.type) updateFields.type = req.body.type;
    if (req.body.date) updateFields.date = req.body.date;
    if (req.body.notes) updateFields.notes = req.body.notes;

    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateFields,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


const deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
}
