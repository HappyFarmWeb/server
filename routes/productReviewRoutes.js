const express = require('express');
const router = express.Router();
const {
    getReviews,
    getReviewsCount,
    getReviewById,
    addReview,
} = require('../controllers/productReviewController');

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

// Get all reviews or filter by productId
router.get('/', getReviews);

// Get the total count of reviews
router.get('/get/count', getReviewsCount);

// Get a single review by ID
router.get('/:id', getReviewById);

// Add a new review
router.post('/add', userAuth,addReview);

module.exports = router;
