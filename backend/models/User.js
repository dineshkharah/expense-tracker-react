const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0
    },
    totalIncome: {
        type: Number,
        default: 0
    },
    totalExpenses: {
        type: Number,
        default: 0
    }, notifications: [
        {
            message: { type: String, required: true },
            date: { type: Date, default: Date.now },
            read: { type: Boolean, default: false },
            recurringId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RecurringTransaction",
                default: null
            },
            transactionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Transaction",
                default: null
            },
            type: {
                type: String,
                enum: ["recurring", "transaction", "system"],
                default: "system"
            }
        }
    ]




}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
