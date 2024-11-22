const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },

}, { timestamps: true });

personSchema.index({ userId: 1, name: 1 }, { unique: true });

const Person = mongoose.model('Person', personSchema);
module.exports = Person;