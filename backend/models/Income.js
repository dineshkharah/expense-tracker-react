const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    source: {
        type: String,
        required: true,
    }, // salary, business, etc.
    amount: {
        type: String, //String to store encrypted amount
        required: true,
        min: [0, 'Amount must be positive.'],
    },
    dateReceived: {
        type: Date,
        required: false,
    },
    category: {// to be decided later 
        type: String,
        required: true,
    },
    recurring: {
        type: Boolean,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: function () {
            return this.recurring;
        } // required if recurring is true
    },
    nextDate: { //to be decided later
        type: Date,
        required: function () {
            return this.recurring;
        } // required if recurring is true
    },
    notes: {
        type: String,
    }

}, { timestamps: true });


// Calculate nextDate based on frequency
incomeSchema.pre('save', function (next) {
    if (this.recurring && !this.nextDate) {
        let nextDate = new Date(this.dateReceived);
        switch (this.frequency) {
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
        }
        this.nextDate = nextDate;
    }
    next();
});

module.exports = mongoose.model('Income', incomeSchema);