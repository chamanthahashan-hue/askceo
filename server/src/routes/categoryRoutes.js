const express = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, listCategories);
router.post('/', auth, adminOnly, createCategory);
router.put('/:id', auth, adminOnly, updateCategory);
router.delete('/:id', auth, adminOnly, deleteCategory);

module.exports = router;
