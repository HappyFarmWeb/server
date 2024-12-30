const { MyList } = require('../models/myList');
const mongoose = require('mongoose');

// Fetch all items in the list
const getMyList = async (req, res) => {
    try {
        const query = req.query;

        // Validate userId if it's included in the query
        if (query.userId && !mongoose.Types.ObjectId.isValid(query.userId)) {
            return res.status(400).json({ success: false, message: 'Invalid userId' });
        }

        // Fetch the data and populate productId
        const myList = await MyList.find(query).populate('productId');

        if (!myList || myList.length === 0) {
            return res.status(404).json({ success: false, message: 'No items found!' });
        }

        res.status(200).json({ success: true, data: myList });
    } catch (error) {
        console.error('Error fetching my list:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Add item to the list
const addItemToMyList = async (req, res) => {
    try {
        const existingItem = await MyList.findOne({
            productId: req.body.productId,
            userId: req.body.userId,
        });

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Product already exists in My List!',
            });
        }

        const newItem = new MyList({
            productId: req.body.productId,
            userId: req.body.userId,
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete item from the list
const deleteItemFromMyList = async (req, res) => {
    try {
        const deletedItem = await MyList.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found!',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item successfully deleted!',
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Fetch a single item by ID
const getItemById = async (req, res) => {
    try {
        const item = await MyList.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found!',
            });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update item details
const updateItem = async (req, res) => {
    try {
        const updatedItem = await MyList.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    productTitle: req.body.productTitle,
                    image: req.body.image,
                    rating: req.body.rating,
                    priceDetails: {
                        quantity: req.body.priceDetails.quantity,
                        actualPrice: req.body.priceDetails.actualPrice,
                        oldPrice: req.body.priceDetails.oldPrice || 0,
                        discount: req.body.priceDetails.discount || 0,
                        type: req.body.priceDetails.type || '',
                    },
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found!',
            });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getMyList,
    addItemToMyList,
    deleteItemFromMyList,
    getItemById,
    updateItem
};
