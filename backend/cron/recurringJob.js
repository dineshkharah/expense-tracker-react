const cron = require('node-cron');
const RecurringTransactions = require('../models/RecurringTransactions');
const User = require('../models/User');
const { decrypt } = require('../utils/encryption');

cron.schedule("0 9 * * *", async () => {
    console.log(" Running CRON: Checking upcoming recurring payments...");

    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const upcomingRecurrings = await RecurringTransactions.find({
            isActive: true,
            nextDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        for (const recurring of upcomingRecurrings) {
            const user = await User.findById(recurring.userId);
            if (!user) continue;

            const latestAmountEncrypted = recurring.amounts[recurring.amounts.length - 1].amount;
            const latestAmount = decrypt(latestAmountEncrypted)

            const message =
                recurring.type === "expense"
                    ? `Upcoming payment of ₹${latestAmount} for ${recurring.source} is due on ${recurring.nextDate.toDateString()}`
                    : `Expected income of ₹${latestAmount} (${recurring.source}) is expected on ${recurring.nextDate.toDateString()}`;

            user.notifications.push({
                type: "recurring",
                recurringId: recurring._id,
                message: message,
                date: new Date(),
                read: false
            });
            await user.save();
        }

        console.log("CRON job completed successfully.");

    } catch (error) {
        console.error(" Error in CRON job:", error);
    }
})