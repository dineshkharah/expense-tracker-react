const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const personRoutes = require('./routes/personRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const recurringExpenseRoutes = require('./routes/recurringExpenseRoutes');
const debtRoutes = require('./routes/debtRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const savingRoutes = require('./routes/savingRoutes');

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
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/persons', personRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/recurring-expenses', recurringExpenseRoutes);
app.use('/api/v1/debts', debtRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/savings', savingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
