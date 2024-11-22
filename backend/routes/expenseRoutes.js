const express = require('express');
const { createExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');
const authenticateUser = require('../middleware/authenticateUser');


const router = express.Router();

// POST /api/v1/expenses - Add an expense
router.post('/', authenticateUser, createExpense);

// GET /api/v1/expenses - Get all expenses
router.get('/', authenticateUser, getExpenses);

// PUT /api/v1/expenses/:id - Update an expense
router.put('/:id', authenticateUser, updateExpense);

// DELETE /api/v1/expenses/:id - Delete an expense
router.delete('/:id', authenticateUser, deleteExpense);

module.exports = router;
