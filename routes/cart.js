const { Cart } = require('../models/cart');
const express = require("express");

const router = express.Router();

// GET: Fetch all cart items (with query parameters for filtering)
router.get("/", async (req, res) => {
  try {
    const cartList = await Cart.find(req.query);

    if (!cartList || cartList.length === 0) {
      return res.status(404).json({ success: false, message: "No cart items found." });
    }

    res.status(200).json(cartList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Add a new cart item
router.post("/add", async (req, res) => {
  try {
    // Check if the product already exists in the user's cart
    const existingItem = await Cart.findOne({ productId: req.body.productId, userId: req.body.userId });

    if (existingItem) {
      return res
        .status(409)
        .json({ success: false, message: "Product already exists in the cart." });
    }

    // Check if there's enough stock available
    if (req.body.quantity > req.body.countInStock) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock available." });
    }

    // Create the new cart item
    const cartItem = new Cart({
      productTitle: req.body.productTitle,
      image: req.body.image,
      rating: req.body.rating,
      priceDetails: req.body.priceDetails,
      quantity: req.body.quantity,
      subTotal: req.body.subTotal,
      productId: req.body.productId,
      countInStock: req.body.countInStock,
      userId: req.body.userId,
    });

    // Save the cart item to the database
    const savedItem = await cartItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove a cart item
router.delete("/:id", async (req, res) => {
  try {
    // Find and delete the cart item
    const deletedItem = await Cart.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.status(200).json({ success: true, message: "Cart item deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch a single cart item by ID
router.get("/:id", async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT: Update a cart item
router.put("/:id", async (req, res) => {
  try {
    // Update the cart item
    const updatedCartItem = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedCartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    // Check if there is enough stock available after update (only if quantity is updated)
    if (req.body.quantity && req.body.quantity > updatedCartItem.countInStock) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock available." });
    }

    res.status(200).json(updatedCartItem);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
