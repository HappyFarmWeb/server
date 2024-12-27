const { Cart } = require('../models/cart');
const {Product } = require('../models/products');
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const cartList = await Cart.find(req.query)
//       .populate({
//         path: "productId",
//         model: "Product",
//         select: "name description images prices rating quantity subTotal", // Populate only necessary fields
//       });

//     if (!cartList || cartList.length === 0) {
//       return res.status(404).json({ success: false, message: "No cart items found." });
//     }

//     // Modify cart list to filter the prices array based on the priceId
//     const modifiedCartList = cartList.map(cartItem => {
//       const product = cartItem.productId;

//       if (product && product.prices) {
//         // Filter prices array to return only the price object that matches the cart's priceId
//         const matchedPrice = product.prices.find(p => p._id.toString() === cartItem.priceId.toString());
        
//         // Replace the prices array with the matched price object
//         product.prices = matchedPrice ? [matchedPrice] : [];
//       }

//       return cartItem;
//     });

//     res.status(200).json({ success: true, data: modifiedCartList });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const cartList = await Cart.find(req.query)
      .populate({
        path: "productId",
        model: "Product",
        select: "name description images prices rating quantity subTotal", // Populate only necessary fields
      });

    if (!cartList || cartList.length === 0) {
      return res.status(404).json({ success: false, message: "No cart items found." });
    }

    // Modify cart list to include all prices for each product
    const modifiedCartList = cartList.map(cartItem => {
      const product = cartItem.productId;

      if (product && product.prices) {
        // Simply return all prices without any filtering
        product.prices = product.prices;  // No filtering, just return all prices
      }

      return cartItem;
    });

    res.status(200).json({ success: true, data: modifiedCartList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.post("/add", async (req, res) => {
  try {
    const { productId, priceId, userId, quantity } = req.body;

    // Validate the provided IDs
    if (!productId || !priceId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "productId, priceId, and userId are required." });
    }

    // Check if the product already exists in the user's cart
    const existingItem = await Cart.findOne({ productId, priceId, userId });

    if (existingItem) {
      return res
        .status(409)
        .json({ success: false, message: "Product already exists in the cart." });
    }

    // Retrieve the product and price details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const price = product.prices.find((p) => p._id.toString() === priceId);
    console.log("Price: ", price);
    if (!price) {
      return res.status(404).json({ success: false, message: "Price not found." });
    }

    // Check stock availability
    if (quantity > price.countInStock) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock available." });
    }

    // Create the new cart item
    const cartItem = new Cart({
      productId,
      priceId,
      userId,
      quantity,
      subTotal: quantity * price.actualPrice,
    });

    // Save the cart item to the database
    const savedItem = await cartItem.save();

    res.status(201).json({
      success: true,
      message: "Cart item added successfully.",
      data: savedItem,
    });
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
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedData={

//     }
//     // Update the cart item
//     const updatedCartItem = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     if (!updatedCartItem) {
//       return res.status(404).json({ success: false, message: "Cart item not found." });
//     }

//     // Check if there is enough stock available after update (only if quantity is updated)
//     if (req.body.quantity && req.body.quantity > updatedCartItem.countInStock) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Insufficient stock available." });
//     }

//     res.status(200).json(updatedCartItem);
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// router.put("/:id", async (req, res) => {
//   try {
//     const { quantity } = req.body;

//     // Find the cart item
//     const cartItem = await Cart.findById(req.params.id).populate("productId");
//     if (!cartItem) {
//       return res.status(404).json({ success: false, message: "Cart item not found." });
//     }

//     // Ensure product price exists
//     const productPrice = cartItem.productId.prices[0].actualPrice;
//     if (!productPrice || isNaN(productPrice)) {
//       return res.status(400).json({ success: false, message: "Product price is invalid." });
//     }

//     // Check if quantity is provided and validate it
//     const updatedQuantity = quantity || cartItem.quantity;
//     if (updatedQuantity > cartItem.productId.countInStock) {
//       return res.status(400).json({ success: false, message: "Insufficient stock available." });
//     }

//     // Update the quantity and recalculate the subtotal
//     const updatedData = {
//       quantity: updatedQuantity,
//       subTotal: updatedQuantity * productPrice, // Calculate subtotal based on quantity and product price
//     };

//     // Perform the update
//     const updatedCartItem = await Cart.findByIdAndUpdate(req.params.id, updatedData, {
//       new: true,
//     });

//     res.status(200).json(updatedCartItem);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

router.put("/:id", async (req, res) => {
  try {
    const { quantity, priceId } = req.body;

    // Validate if priceId and quantity are provided
    if (!priceId || !quantity) {
      return res.status(400).json({ success: false, message: "PriceId and quantity are required." });
    }

    // Find the cart item
    const cartItem = await Cart.findById(req.params.id).populate("productId");
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    // Find the product and the price using the priceId
    const product = cartItem.productId;
    const selectedPrice = product.prices.find(price => price._id.toString() === priceId.toString());

    if (!selectedPrice) {
      return res.status(400).json({ success: false, message: "Invalid priceId provided." });
    }

    // Check if quantity is valid and does not exceed stock
    if (quantity > product.countInStock) {
      return res.status(400).json({ success: false, message: "Insufficient stock available." });
    }

    // Recalculate subtotal
    const subTotal = selectedPrice.actualPrice * quantity;

    // Update the cart item with new quantity and subtotal
    const updatedData = {
      quantity: quantity,
      priceId: priceId,  // Update priceId if it's part of the request
      subTotal: subTotal,
    };

    // Perform the update
    const updatedCartItem = await Cart.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    }).populate("productId");

    res.status(200).json(updatedCartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;
