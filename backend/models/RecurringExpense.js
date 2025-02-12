const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: String, //String to store encrypted amount
        required: true,
        min: [0, 'Amount must be positive.'],
    },
    dueDate: {
        type: Date,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true,
    },
    autoPay: {
        type: Boolean,
        required: true,
    }, // true if auto pay is enabled
    notificationsEnabled: {
        type: Boolean,
        required: true,
    }, // true if notifications are enabled and for future feature only
    notes: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);