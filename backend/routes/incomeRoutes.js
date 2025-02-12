const express = require('express');
const {
    createIncome,
    getAllIncome,
    getIncomeById,
    updateIncome,
    deleteIncome
} = require('../controllers/incomeController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createIncome);

router.get('/', authenticateUser, getAllIncome);

router.get('/:id', authenticateUser, getIncomeById);

router.put('/:id', authenticateUser, updateIncome);

router.delete('/:id', authenticateUser, deleteIncome);

module.exports = router;


