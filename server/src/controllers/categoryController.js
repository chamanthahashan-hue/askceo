const Category = require('../models/Category');

async function listCategories(req, res) {
  const categories = await Category.find().sort({ name: 1 });
  return res.json({ categories });
}

async function createCategory(req, res) {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  const category = await Category.create({ name: name.trim() });
  return res.status(201).json({ category });
}

async function updateCategory(req, res) {
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: name?.trim() },
    { new: true, runValidators: true }
  );
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  return res.json({ category });
}

async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  return res.json({ message: 'Category deleted' });
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
