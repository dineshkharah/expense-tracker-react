const Debt = require('../models/Debt');

const { encrypt, decrypt } = require('../utils/encryption');

const createDebt = async (req, res) => {
    try {
        const { lender, totalAmount, paidAmount, dueDate, notes } = req.body;

        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found' });
        }

        if (!lender || !totalAmount || !paidAmount || !dueDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const encryptedAmount = encrypt(totalAmount.toString());
        const encryptedPaidAmount = encrypt(paidAmount.toString()); //the reason for toString is that the value of paidAmount can be 0, which is falsy

        const remainingBalance = (parseFloat(totalAmount) - parseFloat(paidAmount)).toString();
        const encryptedRemainingBalance = encrypt(remainingBalance);

        const newDebt = new Debt({
            userId,
            lender,
            totalAmount: encryptedAmount,
            paidAmount: encryptedPaidAmount,
            remainingBalance: encryptedRemainingBalance,
            dueDate,
            notes
        });

        await newDebt.save();
        res.status(201).json({ message: 'Debt added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllDebts = async (req, res) => {
    try {
        const debts = await Debt.find({ userId: req.user.userId });
        const decryptDebts = debts.map(debt => {
            return {
                ...debt._doc,
                totalAmount: decrypt(debt.totalAmount),
                paidAmount: decrypt(debt.paidAmount),
                remainingBalance: decrypt(debt.remainingBalance)
            }
        });
        res.json(decryptDebts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getDebtById = async (req, res) => {
    try {
        const debt = await Debt.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!debt) {
            return res.status(404).json({ message: 'Debt not found' });
        }

        debt.totalAmount = decrypt(debt.totalAmount);
        debt.paidAmount = decrypt(debt.paidAmount);
        debt.remainingBalance = decrypt(debt.remainingBalance);

        res.json(debt);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateDebt = async (req, res) => {
    try {
        const { lender, totalAmount, paidAmount, dueDate, notes } = req.body;

        const debt = await Debt.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!debt) {
            return res.status(404).json({ message: 'Debt not found' });
        }

        const decryptedTotalAmount = parseFloat(decrypt(debt.totalAmount));
        const decryptedPaidAmount = parseFloat(decrypt(debt.paidAmount));

        let newTotalAmount = decryptedTotalAmount;
        let newPaidAmount = decryptedPaidAmount;

        // Input Validation to prevent NaN and Non-numerical values
        if (totalAmount !== undefined) {
            if (isNaN(totalAmount) || totalAmount < 0) {
                return res.status(400).json({ message: 'Invalid total amount' });
            }
            newTotalAmount = parseFloat(totalAmount);
            debt.totalAmount = encrypt(newTotalAmount.toString());
        }

        if (paidAmount !== undefined) {
            if (isNaN(paidAmount) || paidAmount < 0) {
                return res.status(400).json({ message: 'Invalid paid amount' });
            }
            newPaidAmount = parseFloat(paidAmount);
            debt.paidAmount = encrypt(newPaidAmount.toString());
        }

        // Prevents Overpayment
        if (newPaidAmount > newTotalAmount) {
            return res.status(400).json({ message: 'Paid amount cannot be greater than total amount' });
        }

        debt.paidAmount = encrypt(newPaidAmount.toString());

        const remainingBalance = (newTotalAmount - newPaidAmount).toString();
        debt.remainingBalance = encrypt(remainingBalance);

        // If the debt is fully paid, set the paid date (to be implemented maybe)

        // The commented code to be explored later
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // Prevents Injection  (Review)
        // if (lender) {
        //     const sanitizedLender = lender.replace();
        //     debt.lender = sanitizedLender;
        // }

        // debt.dueDate = dueDate || debt.dueDate;

        // if (notes) {
        //     const sanitizedNotes = notes.replace(/['";--]/g, '');
        //     debt.notes = sanitizedNotes;
        // }

        debt.lender = lender || debt.lender;
        debt.dueDate = dueDate || debt.dueDate;
        debt.notes = notes || debt.notes

        await debt.save();
        res.json({ message: 'Debt updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteDebt = async (req, res) => {
    try {
        const debt = await Debt.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!debt) {
            return res.status(404).json({ message: 'Debt not found' });
        }

        res.json({ message: 'Debt deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createDebt,
    getAllDebts,
    getDebtById,
    updateDebt,
    deleteDebt
};