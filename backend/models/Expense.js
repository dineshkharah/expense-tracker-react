const { min } = require('lodash');
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    personName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: String, //String to store encrypted amount
        required: true,
        min: [0, 'Amount must be positive.'],
    },
    type: {
        type: String,
        required: true,
    }, // income or expense
    date: {
        type: Date,
        required: false,
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
