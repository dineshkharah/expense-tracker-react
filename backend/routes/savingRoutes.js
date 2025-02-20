const express = require('express');

const {
    createSavingsGoal,
    getAllSavingsGoals,
    getSavingGoalById,
    updateSavingGoal,
    deleteSavingGoal
} = require('../controllers/savingController');

const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createSavingsGoal);

router.get('/', authenticateUser, getAllSavingsGoals);

router.get('/:id', authenticateUser, getSavingGoalById);

router.put('/:id', authenticateUser, updateSavingGoal);

router.delete('/:id', authenticateUser, deleteSavingGoal);

module.exports = router;
