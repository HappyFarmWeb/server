const express = require("express");
const router = express.Router();
const multer = require("multer");
const categoryController = require("../controllers/categoryController");

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`,adminAuth, upload.array("images"), categoryController.uploadImages);
router.get(`/`, categoryController.getCategories);
router.get(`/get/count`,userAuth, categoryController.getCategoryCount);
router.get(`/subCat/get/count`,userAuth, categoryController.getSubCategoryCount);
router.get("/:id",userAuth, categoryController.getCategoryById);
router.post("/create", adminAuth,categoryController.createCategory);
router.delete("/deleteImage",adminAuth, categoryController.deleteImage);
router.delete("/:id",adminAuth,categoryController.deleteCategory);
router.put("/:id", adminAuth,categoryController.updateCategory);

module.exports = router;