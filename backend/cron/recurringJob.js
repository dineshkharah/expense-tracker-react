const cron = require('node-cron');
const RecurringTransaction = require('../models/recurringTransactions');
const User = require('../models/User');
const { decrypt } = require('../utils/encryption');

// cron.schedule("*/10 * * * * *", async () => { for every 10 seconds testing // 0 9 * * * for every day at 9 AM
cron.schedule("0 9 * * *", async () => {
    console.log(" Running CRON: Checking upcoming recurring payments...");

    try {
        const today = new Date();
        const next7days = new Date(today);
        next7days.setDate(next7days.getDate() + 7);

        const upcomingRecurrings = await RecurringTransaction.find({
            isActive: true,
            nextDate: {
                $lt: next7days
            }
        });

        for (const recurring of upcomingRecurrings) {
            const user = await User.findById(recurring.userId);
            if (!user) continue;

            if (!user.notifications) user.notifications = [];

            const latestAmountEncrypted = recurring.amounts[recurring.amounts.length - 1].amount;
            const latestAmount = decrypt(latestAmountEncrypted)

            const message =
                recurring.type === "expense"
                    ? `Upcoming payment of ₹${latestAmount} for ${recurring.source} is due on ${recurring.nextDate.toDateString()}`
                    : `Expected income of ₹${latestAmount} (${recurring.source}) is expected on ${recurring.nextDate.toDateString()}`;

            const existingNotification = user.notifications.find(
                notif => notif.type === "recurring" && notif.recurringId.toString() === recurring._id.toString()
            );

            if (existingNotification) {
                existingNotification.message = message;
                existingNotification.date = new Date();
                existingNotification.read = false;
                console.log(` Updated notification for user ${user._id} regarding recurring ${recurring._id}`);
            } else {
                user.notifications.push({
                    type: "recurring",
                    recurringId: recurring._id,
                    message: message,
                    date: new Date(),
                    read: false
                });
                console.log(` Created new notification for user ${user._id} regarding recurring ${recurring._id}`);
            }
            await user.save();
        }

        // Cleanup old notifications, older than 60 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (process.env.NOTIFICATION_RETENTION_DAYS || 60));

        const allUsers = await User.find({ "notifications.0": { $exists: true } });

        for (const user of allUsers) {
            const beforeCount = user.notifications.length;

            user.notifications = user.notifications.filter(
                n => new Date(n.date) > cutoff
            );

            const afterCount = user.notifications.length;
            if (afterCount < beforeCount) {
                await user.save();
                console.log(`Removed ${beforeCount - user.notifications.length} old notifications for user ${user._id}`);
            }

        }


        console.log("CRON job completed successfully.");

    } catch (error) {
        console.error(" Error in CRON job:", error);
    }
})