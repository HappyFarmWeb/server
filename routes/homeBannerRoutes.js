const express = require('express');
const multer = require('multer');
const {
  uploadImages,
  getAllBanners,
  getBannerById,
  createBanner,
  deleteBannerImage,
  deleteBanner,
  updateBanner,
} = require('../controllers/homeBannerController');

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });

router.post('/upload', adminAuth,upload.array("images"), uploadImages);
router.get('/', getAllBanners);
router.get('/:id',userAuth, getBannerById);
router.post('/create',adminAuth, createBanner);
router.delete('/deleteImage', deleteBannerImage); //changed here
router.delete('/:id',adminAuth, deleteBanner);
router.put('/:id',adminAuth, updateBanner);

module.exports = router;
