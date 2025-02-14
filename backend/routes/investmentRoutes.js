const express = require('express');
const {
    createInvestment,
    getAllInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment
} = require('../controllers/investmentController');

const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createInvestment);

router.get('/', authenticateUser, getAllInvestments);

router.get('/:id', authenticateUser, getInvestmentById);

router.put('/:id', authenticateUser, updateInvestment);

router.delete('/:id', authenticateUser, deleteInvestment);

module.exports = router;