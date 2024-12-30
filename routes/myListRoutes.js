const express = require('express');
const router = express.Router();
const {
    getMyList,
    addItemToMyList,
    deleteItemFromMyList,
    getItemById,
    updateItem
} = require('../controllers/myListController');

// MiddleWares
const userAuth = require("../middlewares/userAuth");
const adminAuth = require("../middlewares/adminAuth");

// Route for fetching all items
router.get('/',userAuth, getMyList);

// Route for adding item to MyList
router.post('/add',userAuth, addItemToMyList);

// Route for deleting item from MyList
router.delete('/:id',userAuth, deleteItemFromMyList);

// Route for fetching a single item by ID
router.get('/:id',userAuth, getItemById);

// Route for updating item details
router.put('/:id',userAuth, updateItem);

module.exports = router;
