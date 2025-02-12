const Income = require('../models/Income');

const { encrypt, decrypt } = require('../utils/encryption');

const createIncome = async (req, res) => {
    try {
        const { source, amount, dateReceived, category, recurring, frequency, notes } = req.body;

        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found' });
        }

        if (!source || !amount || !category || recurring === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(amount);

        let nextDate = null;
        if (recurring && dateReceived) {
            nextDate = new Date(dateReceived);
            switch (frequency) {
                case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
                case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
                case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
                case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
            }
        }

        const newIncome = new Income({
            userId,
            source,
            amount: encryptedAmount,
            dateReceived,
            category,
            recurring,
            frequency: recurring ? frequency : undefined,
            nextDate,
            notes
        });

        await newIncome.save();
        res.status(201).json({ message: 'Income added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getIncomeById = async (req, res) => {
    try {
        const income = await Income.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        income.amount = decrypt(income.amount);

        res.json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getAllIncome = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user.userId });
        const decryptedIncomes = incomes.map(income => {
            return {
                ...income._doc,
                amount: decrypt(income.amount)
            }
        });
        res.json(decryptedIncomes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateIncome = async (req, res) => {
    try {
        const { source, amount, dateReceived, category, recurring, frequency, notes } = req.body;

        const income = await Income.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        if (amount) {
            income.amount = encrypt(amount);
        }

        income.source = source || income.source;
        income.dateReceived = dateReceived || income.dateReceived;
        income.category = category || income.category;
        income.recurring = recurring !== undefined ? recurring : income.recurring;
        income.frequency = recurring !== undefined ? (recurring ? frequency : undefined) : income.frequency;
        income.notes = notes || income.notes;

        if (recurring && dateReceived) {
            let nextDate = new Date(dateReceived);
            switch (frequency) {
                case 'daily': income.nextDate.setDate(income.nextDate.getDate() + 1); break;
                case 'weekly': income.nextDate.setDate(income.nextDate.getDate() + 7); break;
                case 'monthly': income.nextDate.setMonth(income.nextDate.getMonth() + 1); break;
                case 'yearly': income.nextDate.setFullYear(income.nextDate.getFullYear() + 1); break;
            }
            income.nextDate = nextDate;
        }

        await income.save();
        res.json({ message: 'Income updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createIncome,
    getIncomeById,
    getAllIncome,
    updateIncome,
    deleteIncome
};