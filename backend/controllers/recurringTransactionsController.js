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

// Create
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

        res.status(201).json({
            ...recurring._doc,
            latestAmount: decrypt(recurring.amounts[recurring.amounts.length - 1].amount),
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all
const getRecurring = async (req, res) => {
    try {
        const recurs = await RecurringTransaction.find({ userId: req.user.userId });
        const response = recurs.map(r => ({
            ...r._doc,
            latestAmount: decrypt(r.amounts[r.amounts.length - 1].amount),
        }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update
const updateRecurring = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!recurring) return res.status(404).json({ message: "Recurring rule not found" });

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
        recurring.isActive = req.body.isActive ?? recurring.isActive;

        await recurring.save();

        res.json({
            ...recurring._doc,
            latestAmount: decrypt(recurring.amounts[recurring.amounts.length - 1].amount),
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete
const deleteRecurring = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId,
        });
        if (!recurring) return res.status(404).json({ message: "Recurring rule not found" });

        res.json({
            message: "Recurring rule deleted",
            deleted: {
                ...recurring._doc,
                latestAmount: decrypt(recurring.amounts[recurring.amounts.length - 1].amount),
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Execute
const executeRecurring = async (req, res) => {
    try {
        const { action = "paid", snoozeDays = 7 } = req.body;

        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.userId,
            isActive: true,
        });

        if (!recurring) {
            return res.status(404).json({ message: "Active recurring rule not found" });
        }

        const today = new Date();

        const latest = recurring.amounts
            .filter(a => new Date(a.effectiveFrom) <= today)
            .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0];

        if (!latest) {
            return res.status(404).json({ message: "No valid amount found" });
        }

        const decryptedAmount = decrypt(latest.amount);
        let transaction = null;

        if (action === "paid") {

            const alreadyPaid = recurring.history.some(
                h => h.status === "paid" &&
                    h.date >= recurring.startDate &&
                    h.date <= recurring.nextDate
            );

            if (alreadyPaid) {
                return res.status(400).json({ message: "Transaction already paid for this period" });
            }

            transaction = await Transaction.create({
                userId: req.user.userId,
                source: recurring.source,
                category: recurring.category,
                amount: latest.amount,
                type: recurring.type,
                date: today,
                recurring: true,
                frequency: recurring.frequency,
                notes: recurring.notes,
            });

            const user = await User.findById(req.user.userId);
            const numericValue = parseFloat(decryptedAmount);
            if (recurring.type === "income") {
                user.balance += numericValue
                user.totalIncome += numericValue
            } else {
                user.balance -= numericValue
                user.totalExpenses += numericValue
            }

            await user.save();

            recurring.history.push({
                transactionId: transaction._id,
                amount: latest.amount,
                date: today,
                status: "paid"
            });

        } else if (action === "skipped") {
            recurring.history.push({
                transactionId: null,
                amount: latest.amount,
                date: today,
                status: "skipped"
            });

        } else if (action === "snoozed") {
            const snoozedUntil = new Date(recurring.nextDate || today);
            snoozedUntil.setDate(snoozedUntil.getDate() + parseInt(snoozeDays));

            recurring.history.push({
                transactionId: null,
                amount: latest.amount,
                date: today,
                status: "snoozed",
                snoozedUntil
            });
            recurring.nextDate = snoozedUntil;
        }

        if (action !== "snoozed") {
            recurring.nextDate = getNextDate(recurring.nextDate, recurring.frequency);
        }

        await recurring.save();

        res.status(201).json({
            message: "Transaction created",
            _id: recurring._id,
            userId: recurring.userId,
            source: recurring.source,
            category: recurring.category,
            type: recurring.type,
            frequency: recurring.frequency,
            startDate: recurring.startDate,
            nextDate: recurring.nextDate,
            isActive: recurring.isActive,
            notes: recurring.notes,

            latestAmount: parseFloat(decryptedAmount),

            amounts: recurring.amounts.map(a => ({
                amount: parseFloat(decrypt(a.amount)),
                effectiveFrom: a.effectiveFrom,
            })),

            history: recurring.history.map(h => ({
                date: h.date,
                amount: parseFloat(decrypt(h.amount)),
                status: h.status || "paid",
                snoozedUntil: h.snoozedUntil || null,
                transactionId: h.transactionId
            })),

            createdAt: recurring.createdAt,
            updatedAt: recurring.updatedAt,

            transactionCreated: transaction && {
                _id: transaction._id,
                date: transaction.date,
                amount: parseFloat(decryptedAmount),
                type: transaction.type,
                category: transaction.category,
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createRecurring,
    getRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurring,
};
