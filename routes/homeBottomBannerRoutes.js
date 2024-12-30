const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  uploadImages,
  getAllBanners,
  getBannerById,
  createBanner,
  deleteImage,
  deleteBanner,
  updateBanner,
} = require("../controllers/homeBottomBannerController");

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

router.post(`/upload`, adminAuth,upload.array("images"), uploadImages);
router.get(`/`, getAllBanners);
router.get(`/:id`,userAuth, getBannerById);
router.post(`/create`,adminAuth, createBanner);
router.delete(`/deleteImage`,adminAuth, deleteImage);
router.delete(`/:id`,adminAuth, deleteBanner);
router.put(`/:id`, adminAuth,updateBanner);

module.exports = router;
