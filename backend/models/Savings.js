const mongoose = require('mongoose');

const savingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    goalName: {
        type: String,
        required: true,
    }, //eg: buying a car, vacation, etc. 
    targetAmount: {
        type: String, //String to store encrypted amount
        required: true,
        min: [0, 'Amount must be positive.'],
    },
    savedAmount: {
        type: String, //String to store encrypted amount
        required: true,
        default: 0,
    },
    deadline: {
        type: Date,
        required: true,
    },
    progress: {
        type: String, //String to store encrypted amount
        required: true,
    },
    notes: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('Savings', savingsSchema);