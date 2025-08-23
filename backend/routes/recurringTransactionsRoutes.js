const express = require('express');
const {
    createRecurring,
    getRecurring,
    updateRecurring,
    deleteRecurring,
} = require('../controllers/recurringTransactionsController');
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();

router.post('/', authenticateUser, createRecurring);
router.get('/', authenticateUser, getRecurring);
router.put('/:id', authenticateUser, updateRecurring);
router.delete('/:id', authenticateUser, deleteRecurring);

module.exports = router;
