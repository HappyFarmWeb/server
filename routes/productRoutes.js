const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/productController");

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

router.post(`/upload`,adminAuth, upload.array("images"), productController.uploadImages);
router.get(`/`,productController.getProducts);
router.get(`/catName`, productController.getProductsByCatName);
router.get(`/catId/:catId`,productController.getProductsByCatId);
router.get(`/subCatId`, productController.getProductsBySubCatId);
router.get('/filterByPrice', productController.filterByPrice);
router.get(`/rating`,productController.getProductsByRating);
router.get(`/get/count`, productController.getProductCount);
router.get(`/featured`, productController.getFeaturedProducts);
router.get(`/recentlyViewd`, productController.getRecentlyViewed);
router.post(`/recentlyViewd`,userAuth, productController.addRecentlyViewed);
router.post(`/create`, adminAuth,productController.createProduct);
router.get("/:id",productController.getProductById);
router.delete("/deleteImage",adminAuth, productController.deleteImage);
router.delete("/:id",adminAuth, productController.deleteProduct);
router.put("/:id", adminAuth,productController.updateProduct);

module.exports = router;

