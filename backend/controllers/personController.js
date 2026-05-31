const Person = require("../models/Person");
const asyncHandler = require("../middleware/asyncHandler");

const createPerson = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const person = await Person.create({
    userId: req.user.userId,
    name,
  });
  res.status(201).json(person);
});

const getPersons = asyncHandler(async (req, res) => {
  const persons = await Person.find({ userId: req.user.userId });
  res.status(200).json(persons);
});

const updatePerson = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const person = await Person.findByIdAndUpdate(
    { _id: req.params.id, userId: req.user.userId }, //yaha basically verify ho raha hai
    { name }, //yaha update ho raha hai
    { new: true },
  );
  if (!person) {
    return res.status(404).json({ message: "Person not found" });
  }
  res.status(200).json(person);
});

const deletePerson = asyncHandler(async (req, res) => {
  const person = await Person.findByIdAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!person) {
    return res.status(404).json({ message: "Person not found" });
  }

  res.status(200).json({ message: "Person deleted successfully" });
});

module.exports = {
  createPerson,
  getPersons,
  updatePerson,
  deletePerson,
};
