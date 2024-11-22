const express = require('express');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createCategory);

router.get('/', authenticateUser, getCategories);

router.put('/:id', authenticateUser, updateCategory);

router.delete('/:id', authenticateUser, deleteCategory);

module.exports = router;