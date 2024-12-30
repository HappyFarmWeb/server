// routes/orders.js
const express = require('express');
const router = express.Router();
const {
    getSales,
    getAllOrders,
    getOrderById,
    getOrderCount,
    createOrder,
    deleteOrder,
    updateOrder
} = require('../controllers/orderController');

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

// Route to get sales data
router.get('/sales', adminAuth,getSales);

// Route to get all orders
router.get('/', getAllOrders);

// Route to get order by ID
router.get('/:id',adminAuth, getOrderById);

// Route to get the order count
router.get('/get/count',adminAuth, getOrderCount);

// Route to create a new order
router.post('/create',userAuth, createOrder);

// Route to delete an order by ID
router.delete('/:id',adminAuth, deleteOrder);

// Route to update an order by ID
router.put('/:id',adminAuth, updateOrder);

module.exports = router;
