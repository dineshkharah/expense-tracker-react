const Investment = require('../models/Investment');

const { encrypt, decrypt } = require('../utils/encryption');

const createInvestment = async (req, res) => {
    try {
        const { name, type, amount, purchaseDate, currentValue, profitLoss, notes } = req.body;

        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found' });
        }

        if (!name || !type || !amount || !purchaseDate || !currentValue || !profitLoss) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(amount.toString());
        const encryptedCurrentValue = encrypt(currentValue.toString());
        const encryptedProfitLoss = encrypt(profitLoss.toString());

        const newInvestment = new Investment({
            userId,
            name,
            type,
            amount: encryptedAmount,
            purchaseDate,
            currentValue: encryptedCurrentValue,
            profitLoss: encryptedProfitLoss,
            notes
        });

        await newInvestment.save();
        res.status(201).json({ message: 'Investment added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllInvestments = async (req, res) => {
    try {
        const investments = await Investment.find({ userId: req.user.userId });
        const decryptedInvestments = investments.map(investment => {
            return {
                ...investment._doc,
                amount: decrypt(investment.amount),
                currentValue: decrypt(investment.currentValue),
                profitLoss: decrypt(investment.profitLoss)
            }
        });

        res.status(200).json(decryptedInvestments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getInvestmentById = async (req, res) => {
    try {
        const investment = await Investment.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        investment.amount = decrypt(investment.amount);
        investment.currentValue = decrypt(investment.currentValue);
        investment.profitLoss = decrypt(investment.profitLoss);

        res.status(200).json(investment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const updateInvestment = async (req, res) => {
    try {
        const { name, type, amount, purchaseDate, currentValue, profitLoss, notes } = req.body;

        const investment = await Investment.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        if (amount) {
            investment.amount = encrypt(amount.toString());
        }

        if (currentValue) {
            investment.currentValue = encrypt(currentValue.toString());
        }

        if (profitLoss) {
            investment.profitLoss = encrypt(profitLoss.toString());
        }

        investment.name = name || investment.name;
        investment.type = type || investment.type;
        investment.purchaseDate = purchaseDate || investment.purchaseDate;
        investment.notes = notes || investment.notes;

        await investment.save();
        res.json({ message: 'Investment updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteInvestment = async (req, res) => {
    try {
        const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.json({ message: 'Investment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createInvestment,
    getAllInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment
};
