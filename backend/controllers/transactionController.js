const Transaction = require('../models/Transaction');
const { encrypt, decrypt } = require('../utils/encryption');

const createTransaction = async (req, res) => {
    const { personName, category, amount, type, date, notes, recurring, frequency } = req.body;
    try {
        console.log(req.body);

        if (!amount || !personName || !category || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(amount.toString());
        // console.log("Encrypted amount: ", encryptedAmount);

        let nextDate = null

        if(recurring && frequency) {
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
            personName,
            category,
            amount: encryptedAmount,
            type,
            date,
            recurring,
            frequency: recurring ? frequency : null,
            nextDate,
            notes,
        });
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
    const updateFields = {};

    if (req.body.personName) updateFields.personName = req.body.personName;
    if (req.body.category) updateFields.category = req.body.category;
    if (req.body.amount) updateFields.amount = encrypt(req.body.amount.toString());
    if (req.body.type) updateFields.type = req.body.type;
    if (req.body.date) updateFields.date = req.body.date;
    if (req.body.notes) updateFields.notes = req.body.notes;

    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateFields,
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

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
