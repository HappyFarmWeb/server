const { Cart } = require("../models/cart");
const { Product } = require("../models/products");

exports.getCartList = async (req, res) => {
  try {
    const cartList = await Cart.find(req.query).populate({
      path: "productId",
      model: "Product",
      select: "name description images prices rating quantity subTotal",
    });

    if (!cartList || cartList.length === 0) {
      return res.status(404).json({ success: false, message: "No cart items found." });
    }

    const modifiedCartList = cartList.map((cartItem) => {
      const product = cartItem.productId;
      if (product && product.prices) {
        product.prices = product.prices;
      }
      return cartItem;
    });

    res.status(200).json({ success: true, data: modifiedCartList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addCartItem = async (req, res) => {
  try {
    const { productId, priceId, userId, quantity } = req.body;

    if (!productId || !priceId || !userId) {
      return res.status(400).json({ success: false, message: "productId, priceId, and userId are required." });
    }

    const existingItem = await Cart.findOne({ productId, priceId, userId });
    if (existingItem) {
      return res.status(200).json({ success: false, message: "Product already exists in the cart." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const price = product.prices.find((p) => p._id.toString() === priceId);
    if (!price) {
      return res.status(404).json({ success: false, message: "Price not found." });
    }

    if (quantity > price.countInStock) {
      return res.status(400).json({ success: false, message: "Insufficient stock available." });
    }

    const cartItem = new Cart({
      productId,
      priceId,
      userId,
      quantity,
      subTotal: quantity * price.actualPrice,
    });

    const savedItem = await cartItem.save();
    res.status(201).json({ success: true, message: "Cart item added successfully.", data: savedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const deletedItem = await Cart.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.status(200).json({ success: true, message: "Cart item deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCartItemById = async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity, priceId } = req.body;

    if (!priceId || !quantity) {
      return res.status(400).json({ success: false, message: "PriceId and quantity are required." });
    }

    const cartItem = await Cart.findById(req.params.id).populate("productId");
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    const product = cartItem.productId;
    const selectedPrice = product.prices.find((price) => price._id.toString() === priceId.toString());
    if (!selectedPrice) {
      return res.status(400).json({ success: false, message: "Invalid priceId provided." });
    }

    if (quantity > product.countInStock) {
      return res.status(400).json({ success: false, message: "Insufficient stock available." });
    }

    const subTotal = selectedPrice.actualPrice * quantity;

    const updatedData = {
      quantity: quantity,
      priceId: priceId,
      subTotal: subTotal,
    };

    const updatedCartItem = await Cart.findByIdAndUpdate(req.params.id, updatedData, { new: true }).populate("productId");

    res.status(200).json(updatedCartItem);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
