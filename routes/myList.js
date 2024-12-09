const { MyList } = require('../models/myList');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const myList = await MyList.find(req.query); // Add query filters like userId if provided
        if (!myList) {
            return res.status(404).json({ success: false, message: 'No items found!' });
        }
        res.status(200).json(myList);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



router.post('/add', async (req, res) => {
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
            productId: req.body.productId,
            userId: req.body.userId,
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
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
});




router.get('/:id', async (req, res) => {
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
});


router.put('/:id', async (req, res) => {
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
});



module.exports = router;

