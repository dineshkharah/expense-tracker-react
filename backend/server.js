const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const personRoutes = require('./routes/personRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const debtRoutes = require('./routes/debtRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const savingRoutes = require('./routes/savingRoutes');
const recurringTransactionsRoutes = require('./routes/recurringTransactionsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const RecurringTransaction = require('./models/recurringTransactions');
const User = require('./models/User');

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI,)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/persons', personRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/debts', debtRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/savings', savingRoutes);
app.use('/api/v1/recurring-transactions', recurringTransactionsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

cron.schedule('0 9 * * *', async () => {
    console.log("Cron job running: checking upcoming recurring transactions...");

    try {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Find recurring transactions due today or tomorrow
        const upcoming = await RecurringTransaction.find({
            isActive: true,
            nextDate: { $lte: tomorrow }
        });

        for (let recurring of upcoming) {
            const user = await User.findById(recurring.userId);
            if (!user) continue;

            // Build notification
            const notification = {
                type: "recurring",
                recurringId: recurring._id,
                title: recurring.type === "expense" ? "Upcoming Payment" : "Expected Income",
                message:
                    recurring.type === "expense"
                        ? `Payment of ₹${recurring.amounts.slice(-1)[0].amount} for ${recurring.source} is due on ${recurring.nextDate.toDateString()}`
                        : `Income of ₹${recurring.amounts.slice(-1)[0].amount} (${recurring.source}) is expected on ${recurring.nextDate.toDateString()}`,
                date: new Date(),
                read: false,
                actionRequired: true
            };

            // Save notification (assuming notifications is an array in User model)
            if (!user.notifications) user.notifications = [];
            user.notifications.push(notification);
            await user.save();
        }

        console.log("Notifications created for upcoming recurring transactions.");
    } catch (err) {
        console.error("Error running cron job:", err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));