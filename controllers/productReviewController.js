const { ProductReviews } = require('../models/productReviews');

// Get all reviews or filter by productId
const getReviews = async (req, res) => {
    try {
        let reviews = [];

        if (req.query.productId) {
            reviews = await ProductReviews.find({ productId: req.query.productId });
        } else {
            reviews = await ProductReviews.find();
        }

        if (!reviews) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// Get the total count of reviews
const getReviewsCount = async (req, res) => {
    try {
        const productsReviews = await ProductReviews.countDocuments();

        if (!productsReviews) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json({ productsReviews });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// Get a single review by ID
const getReviewById = async (req, res) => {
    try {
        const review = await ProductReviews.findById(req.params.id);

        if (!review) {
            return res.status(500).json({ message: 'The review with the given ID was not found.' });
        }

        return res.status(200).json(review);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching the review.' });
    }
};

// Add a new review
const addReview = async (req, res) => {
    try {
        const { customerId, customerName, review, customerRating, productId } = req.body;

        const newReview = new ProductReviews({
            customerId,
            customerName,
            review,
            customerRating,
            productId,
        });

        const savedReview = await newReview.save();

        return res.status(201).json(savedReview);
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        });
    }
};

module.exports = {
    getReviews,
    getReviewsCount,
    getReviewById,
    addReview,
};
