const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,

    },
    amounts: [{
        amount: {
            type: String,
            required: true,
        },
        effectiveFrom: {
            type: Date,
            default: Date.now,
        }
    }],
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    nextDate: {
        type: Date,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    notes: {
        type: String,
    },
    history: [
        {
            transactionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Transaction'
            },
            date: {
                type: Date,
                required: true
            },
            amount: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ['paid', 'skipped', 'snoozed', 'pending'],
                default: 'paid'
            },
            snoozedUntil: { type: Date } // only if snoozed
        }
    ]
}, { timestamps: true });

module.exports =
    mongoose.models.RecurringTransaction ||
    mongoose.model("RecurringTransaction", recurringTransactionSchema);

