const express = require("express");
const router = express.Router();
const { getProducts } = require("../controllers/productSearchController");

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

// Route to get products based on query
router.get("/",userAuth, getProducts);

module.exports = router;
