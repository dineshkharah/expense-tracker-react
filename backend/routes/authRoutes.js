const express = require('express');
const { registerUser, loginUser, deleteUser } = require('../controllers/authController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.delete('/delete', authenticateUser, deleteUser);

module.exports = router;
