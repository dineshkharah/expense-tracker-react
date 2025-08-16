const express = require('express');
const { createTransaction, getTransactions, getTransactionById,updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const authenticateUser = require('../middleware/authenticateUser');


const router = express.Router();

// POST /api/v1/transactions - Add an transaction
router.post('/', authenticateUser, createTransaction);

// GET /api/v1/transactions - Get all transactions
router.get('/', authenticateUser, getTransactions);

// GET /api/v1/transactions/:id - Get a transaction by ID
router.get('/:id', authenticateUser, getTransactionById);

// PUT /api/v1/transactions/:id - Update an transaction
router.put('/:id', authenticateUser, updateTransaction);

// DELETE /api/v1/transactions/:id - Delete an transaction
router.delete('/:id', authenticateUser, deleteTransaction);



module.exports = router;
