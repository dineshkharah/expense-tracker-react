const express = require('express');
const {
    createRecurring,
    getRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurring,
} = require('../controllers/recurringTransactionsController');
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();

router.post('/', authenticateUser, createRecurring);
router.get('/', authenticateUser, getRecurring);
router.put('/:id', authenticateUser, updateRecurring);
router.delete('/:id', authenticateUser, deleteRecurring);
router.post('/:id/execute', authenticateUser, executeRecurring);

module.exports = router;
