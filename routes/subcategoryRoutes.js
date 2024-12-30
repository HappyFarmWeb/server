const express = require('express');
const router = express.Router();
const {
  getSubCategories,
  getSubCategoryCount,
  getSubCategoryById,
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
} = require('../controllers/subCategoryController');

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

// Route for fetching all subcategories with pagination
router.get('/', userAuth,getSubCategories);

// Route for getting the count of subcategories
router.get('/get/count',userAuth, getSubCategoryCount);

// Route for fetching a subcategory by ID
router.get('/:id',userAuth, getSubCategoryById);

// Route for creating a new subcategory
router.post('/create',adminAuth, createSubCategory);

// Route for deleting a subcategory by ID
router.delete('/:id',adminAuth, deleteSubCategory);

// Route for updating a subcategory by ID
router.put('/:id',adminAuth, updateSubCategory);

module.exports = router;
