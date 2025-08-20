const express = require('express');
const { registerUser, loginUser, deleteUser, getUser } = require('../controllers/authController');
const authenticateUser = require('../middleware/authenticateUser');
const { validateRegister, validateLogin } = require('../middleware/validator');

const router = express.Router();

router.post('/register', validateRegister, registerUser);

router.post('/login', validateLogin, loginUser);

router.delete('/delete', authenticateUser, deleteUser);

router.get('/get-profile', authenticateUser, getUser);

module.exports = router;
