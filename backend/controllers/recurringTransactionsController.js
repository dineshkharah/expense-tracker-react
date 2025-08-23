const RecurringTransaction = require("../models/recurringTransactions");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/encryption");

function getNextDate(currentDate, frequency) {
    const nextDate = new Date(currentDate);
    switch (frequency) {
        case "daily": nextDate.setDate(nextDate.getDate() + 1); break;
        case "weekly": nextDate.setDate(nextDate.getDate() + 7); break;
        case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
        case "yearly": nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    }
    return nextDate;
}

const createRecurring = async (req, res) => {
    try {
        const { source, category, amount, type, startDate, frequency, notes } = req.body;

        if (!amount || !source || !category || !type || !frequency || !startDate) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const encryptedAmount = encrypt(amount.toString());
        const nextDate = getNextDate(startDate, frequency);

        const recurring = await RecurringTransaction.create({
            userId: req.user.userId,
            source,
            category,
            amounts: [{ amount: encryptedAmount, effectiveFrom: new Date(startDate) }],
            type,
            startDate,
            nextDate,
            frequency,
            notes,
        });

        res.status(201).json(recurring);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getRecurring = async (req, res) => {
    try {
        const recurs = await RecurringTransaction.find({ userId: req.user.userId });
        const response = recurs.map(r => {
            const latest = r.amounts[r.amounts.length - 1];
            return {
                ...r._doc,
                latestAmount: decrypt(latest.amount),
            };
        });
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const updateRecurring = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!recurring) return res.status(404).json({ message: "Recurring rule not found" });

        // if new amount given -> push into amounts history
        if (req.body.amount) {
            recurring.amounts.push({
                amount: encrypt(req.body.amount.toString()),
                effectiveFrom: req.body.effectiveFrom || new Date(),
            });
        }

        recurring.source = req.body.source || recurring.source;
        recurring.category = req.body.category || recurring.category;
        recurring.type = req.body.type || recurring.type;
        recurring.frequency = req.body.frequency || recurring.frequency;
        recurring.notes = req.body.notes || recurring.notes;

        await recurring.save();
        res.json(recurring);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteRecurring = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId,
        });
        if (!recurring) return res.status(404).json({ message: "Recurring rule not found" });

        res.json({ message: "Recurring rule deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createRecurring,
    getRecurring,
    updateRecurring,
    deleteRecurring,
};
