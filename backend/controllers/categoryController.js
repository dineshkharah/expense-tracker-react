const Category = require("../models/Category");
const asyncHandler = require("../middleware/asyncHandler");

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const category = await Category.create({
    userId: req.user.userId,
    name,
  });
  res.status(201).json(category);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ userId: req.user.userId });
  res.status(200).json(categories);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { name },
    { new: true },
  );
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete({
    _id: req.params.id,
    userId: req.user.userId,
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ message: "Category deleted successfully" });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
