const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');

const createTransaction = async (req, res) => {
    const { source, category, amount, type, date, notes, recurring, frequency } = req.body;
    try {
        console.log(req.body);

        if (!amount || !source || !category || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(amount.toString());
        // console.log("Encrypted amount: ", encryptedAmount);

        let nextDate = null

        if (recurring && frequency) {
            nextDate = new Date(date);
            switch (frequency) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'yearly':
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid frequency' });
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
        const numericValue = parseFloat(amount)

        if (type === 'income') {
            user.balance += numericValue;
            user.totalIncome += numericValue;
        } else {
            user.balance -= numericValue;
            user.totalExpenses += numericValue;
        }

        await user.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }

}

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId });
        const decryptedTransactions = transactions.map(transaction => {
            console.log(transaction._doc);
            return ({
                ...transaction._doc,
                amount: decrypt(transaction.amount),
            })

        });
        res.json(decryptedTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Decrypt the amount before sending it back
        const decryptedTransaction = {
            ...transaction._doc,
            amount: decrypt(transaction.amount)
        };

        res.status(200).json(decryptedTransaction);
    } catch (error) {
        console.error('Error fetching transaction by ID:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateTransaction = async (req, res) => {
    try {
        // Find the transaction to update
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Update user balance and totals
        const user = await User.findById(req.user.userId);

        const oldAmount = parseFloat(decrypt(transaction.amount));
        const oldType = transaction.type;

        if (oldType === 'income') {
            user.balance -= oldAmount;
            user.totalIncome -= oldAmount;
        } else {
            user.balance += oldAmount;
            user.totalExpenses -= oldAmount;
        }

        // Calculate new amounts and update user totals
        const newAmount = req.body.amount ? parseFloat(req.body.amount) : oldAmount;
        const newType = req.body.type ? req.body.type : oldType;

        if (newType === 'income') {
            user.balance += newAmount;
            user.totalIncome += newAmount;
        } else {
            user.balance -= newAmount;
            user.totalExpenses += newAmount;
        }

        // Update the transaction with new values
        transaction.source = req.body.source || transaction.source;
        transaction.category = req.body.category || transaction.category;
        if (req.body.amount) {
            transaction.amount = encrypt(newAmount.toString());
        }
        transaction.type = req.body.type || transaction.type;
        transaction.date = req.body.date || transaction.date;
        transaction.notes = req.body.notes || transaction.notes;

        // Save the updated transaction and user
        await transaction.save();
        await user.save();

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const user = await User.findById(req.user.userId);
        const amount = parseFloat(decrypt(transaction.amount));

        if (transaction.type === 'income') {
            user.balance -= amount;
            user.totalIncome -= amount;
        } else {
            user.balance += amount;
            user.totalExpenses -= amount;
        }

        await user.save();

        await transaction.deleteOne();

        res.json({ message: 'Transaction Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
}
