const Person = require('../models/Person');

const createPerson = async (req, res) => {

    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const person = await Person.create({
            userId: req.user.userId,
            name,
        });
        res.status(201).json(person);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const getPersons = async (req, res) => {
    try {
        const persons = await Person.find({ userId: req.user.userId });
        res.status(200).json(persons);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const updatePerson = async (req, res) => {
    const { name } = req.body;
    try {
        const person = await Person.findByIdAndUpdate(
            { _id: req.params.id, userId: req.user.userId }, //yaha basically verify ho raha hai
            { name }, //yaha update ho raha hai
            { new: true }
        )
        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const deletePerson = async (req, res) => {
    try {
        const person = await Person.findByIdAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.status(200).json({ message: 'Person deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createPerson,
    getPersons,
    updatePerson,
    deletePerson,
}