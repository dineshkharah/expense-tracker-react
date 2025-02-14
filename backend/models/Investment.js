const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    }, //eg: apple stocke, particular MF
    type: {
        type: String,
        required: true,
    }, //eg: stock, mutual fund, crypto, real estate etc
    amount: {
        type: String, //String to store encrypted amount
        required: true,
        min: [0, 'Amount must be positive.'],
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    currentValue: {
        type: String,
        required: true,
    },
    profitLoss: {
        type: String, //String to store encrypted amount
        required: true,
    },
    notes: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);