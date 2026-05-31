const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const personRoutes = require("./routes/personRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const debtRoutes = require("./routes/debtRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const savingRoutes = require("./routes/savingRoutes");
const recurringTransactionsRoutes = require("./routes/recurringTransactionsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// Global rate limiter: a backstop so one IP can't hammer the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/persons", personRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/debts", debtRoutes);
app.use("/api/v1/investments", investmentRoutes);
app.use("/api/v1/savings", savingRoutes);
app.use("/api/v1/recurring-transactions", recurringTransactionsRoutes);
app.use("/api/v1/notifications", notificationRoutes);

require("./cron/recurringJob");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
