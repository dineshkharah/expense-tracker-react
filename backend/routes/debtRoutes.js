const express = require('express');

const {
    createDebt,
    getAllDebts,
    getDebtById,
    updateDebt,
    deleteDebt
} = require('../controllers/debtController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createDebt);

router.get('/', authenticateUser, getAllDebts);

router.get('/:id', authenticateUser, getDebtById);

router.put('/:id', authenticateUser, updateDebt);

router.delete('/:id', authenticateUser, deleteDebt);

module.exports = router;