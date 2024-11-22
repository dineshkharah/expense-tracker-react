const express = require('express');
const { createPerson, getPersons, updatePerson, deletePerson } = require('../controllers/personController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/', authenticateUser, createPerson);

router.get('/', authenticateUser, getPersons);

router.put('/:id', authenticateUser, updatePerson);

router.delete('/:id', authenticateUser, deletePerson);

module.exports = router;