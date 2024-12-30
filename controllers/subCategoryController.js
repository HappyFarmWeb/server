const { SubCategory } = require('../models/subCat');

// Fetch all subcategories with pagination
const getSubCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = req.query.perPage;
    const totalPosts = await SubCategory.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({ message: "No data found!" });
    }

    let subCategoryList = [];
    
    if (req.query.page !== undefined && req.query.perPage !== undefined) {
      subCategoryList = await SubCategory.find()
        .populate("catId")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    } else {
      subCategoryList = await SubCategory.find().populate("catId");
    }

    if (!subCategoryList) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json({
      subCategoryList,
      totalPages,
      page,
    });

  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

// Get subcategory count
const getSubCategoryCount = async (req, res) => {
  try {
    const subCatCount = await SubCategory.countDocuments();
    
    if (!subCatCount) {
      return res.status(500).json({ success: false });
    }

    res.send({ subCatCount });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Get a subcategory by ID
const getSubCategoryById = async (req, res) => {
  try {
    const subCat = await SubCategory.findById(req.params.id).populate("catId");
    
    if (!subCat) {
      return res.status(500).json({ message: 'Subcategory not found' });
    }
    
    return res.status(200).send(subCat);
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

// Create a new subcategory
const createSubCategory = async (req, res) => {
  try {
    let subCat = new SubCategory({
      category: req.body.category,
      subCat: req.body.subCat,
    });

    subCat = await subCat.save();
    return res.status(201).json(subCat);
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// Delete a subcategory by ID
const deleteSubCategory = async (req, res) => {
  try {
    const deletedSubCat = await SubCategory.findByIdAndDelete(req.params.id);
    
    if (!deletedSubCat) {
      return res.status(404).json({
        message: 'Subcategory not found',
        success: false,
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Subcategory deleted!',
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

// Update a subcategory
const updateSubCategory = async (req, res) => {
  try {
    const subCat = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        category: req.body.category,
        subCat: req.body.subCat,
      },
      { new: true }
    );

    if (!subCat) {
      return res.status(500).json({
        message: 'Subcategory cannot be updated!',
        success: false,
      });
    }

    return res.send(subCat);
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

module.exports = {
  getSubCategories,
  getSubCategoryCount,
  getSubCategoryById,
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
};
