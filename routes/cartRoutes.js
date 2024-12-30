const express = require("express");
const cartController = require("../controllers/cartController");

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

router.get("/",userAuth, cartController.getCartList);
router.post("/add", userAuth,cartController.addCartItem);
router.delete("/:id",userAuth, cartController.deleteCartItem);
router.get("/:id", userAuth,cartController.getCartItemById);
router.put("/:id",userAuth, cartController.updateCartItem);

module.exports = router;
