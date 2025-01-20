const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadImages,
  getBanners,
  getBannerById,
  createBanner,
  deleteImage,
  deleteBanner,
  updateBanner,
} = require("../controllers/bannerController");

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Routes
router.post(`/upload`,adminAuth, upload.array("images"), uploadImages);
router.get(`/`,getBanners);
router.get(`/:id`,userAuth, getBannerById);
router.post(`/create`,adminAuth, createBanner);
router.delete(`/deleteImage`, deleteImage);   //changed here
router.delete(`/:id`,adminAuth, deleteBanner);
router.put(`/:id`,adminAuth,updateBanner);

module.exports = router;
