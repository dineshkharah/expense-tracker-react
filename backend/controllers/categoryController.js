const Category = require('../models/Category');

const createCategory = async (req, res) => {

    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const category = await Category.create({
            userId: req.user.userId,
            name,
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.userId });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const category = await Category.findByIdAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { name },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
}