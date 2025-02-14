const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lender: {
        type: String,
        required: true,
    }, //eg: bank, friend, etc
    totalAmount: {
        type: String, //String to store encrypted amount
        required: true,
        min: [0, 'Amount must be positive.'],
    },
    paidAmount: {
        type: String, //String to store encrypted amount
        required: true,
        default: 0,
    },
    remainingBalance: {
        type: String, //String to store encrypted amount
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
    },
    // interestRate: {
    //     type: String,
    //     required: true,
    // }, sochna padega iska


}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);