const express = require('express');
const {
    createRecurringExpense,
    getAllRecurringExpenses,
    getRecurringExpenseById,
    updateRecurringExpense,
    deleteRecurringExpense
} = require('../controllers/recurringExpenseController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createRecurringExpense);

router.get('/', authenticateUser, getAllRecurringExpenses);

router.get('/:id', authenticateUser, getRecurringExpenseById);

router.put('/:id', authenticateUser, updateRecurringExpense);

router.delete('/:id', authenticateUser, deleteRecurringExpense);

module.exports = router;