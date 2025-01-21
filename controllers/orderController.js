// controllers/ordersController.js
const { Orders } = require('../models/orders');
const {Product}=require('../models/products');

exports.getSales = async (req, res) => {
    try {
        const ordersList = await Orders.find();

        let totalSales = 0;
        let monthlySales = [
            { month: 'JAN', sale: 0 },
            { month: 'FEB', sale: 0 },
            { month: 'MAR', sale: 0 },
            { month: 'APRIL', sale: 0 },
            { month: 'MAY', sale: 0 },
            { month: 'JUNE', sale: 0 },
            { month: 'JULY', sale: 0 },
            { month: 'AUG', sale: 0 },
            { month: 'SEP', sale: 0 },
            { month: 'OCT', sale: 0 },
            { month: 'NOV', sale: 0 },
            { month: 'DEC', sale: 0 }
        ];

        const currentYear = new Date().getFullYear();

        for (let i = 0; i < ordersList.length; i++) {
            totalSales += parseInt(ordersList[i].amount);
            const str = JSON.stringify(ordersList[i]?.date);
            const monthStr = str.substr(6, 8);
            const month = parseInt(monthStr.substr(0, 2));

            const amt = parseInt(ordersList[i].amount);

            monthlySales[month - 1].sale += amt;
        }

        return res.status(200).json({
            totalSales,
            monthlySales
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const ordersList = await Orders.find(req.query);

        if (!ordersList) {
            return res.status(400).json({ success: false });
        }

        return res.status(200).json(ordersList);
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// exports.getOrderById = async (req, res) => {
//     try {
//         const order = await Orders.findById(req.params.id);

//         if (!order) {
//             return res.status(500).json({ message: 'The order with the given ID was not found.' });
//         }
//         return res.status(200).send(order);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

exports.getOrderById = async (req, res) => {
    try {
        const order = await Orders.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'The order with the given ID was not found.' });
        }
        console.log(order);

        // Populate product data
        const populatedProducts = await Promise.all(order.products.map(async (product) => {
            const productData = await Product.findById(product.productId);
            if (productData) {
                return {
                    ...product._doc, // Existing product data in the order
                    productTitle: productData.name,
                    images: productData.images,
                    price: productData.prices,
                    orderedPrice:order.amount,
                };
            }
            return product; // Fallback if product is not found
        }));

        // Attach populated products to the response
        const orderWithProductData = {
            ...order._doc,
            products: populatedProducts,
        };

        return res.status(200).json(orderWithProductData);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderCount = async (req, res) => {
    try {
        const orderCount = await Orders.countDocuments();

        if (!orderCount) {
            return res.status(500).json({ success: false });
        }

        res.status(200).json({ orderCount });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const order = new Orders({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
            date: req.body.date
        });

        const savedOrder = await order.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({
                message: 'Order not found!',
                success: false
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order Deleted!'
        });
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
};

// exports.updateOrder = async (req, res) => {
//     try {
//         const order = await Orders.findByIdAndUpdate(
//             req.params.id,
//             {
//                 name: req.body.name,
//                 phoneNumber: req.body.phoneNumber,
//                 address: req.body.address,
//                 pincode: req.body.pincode,
//                 amount: req.body.amount,
//                 paymentId: req.body.paymentId,
//                 email: req.body.email,
//                 userid: req.body.userid,
//                 products: req.body.products,
//                 status: req.body.status
//             },
//             { new: true }
//         );

//         if (!order) {
//             return res.status(500).json({
//                 message: 'Order cannot be updated!',
//                 success: false
//             });
//         }

//         res.status(200).send(order);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

exports.updateOrder = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Orders.findByIdAndUpdate(
            req.params.id,
            { status }, 
            { new: true } 
        );

        if (!order) {
            return res.status(404).json({
                message: 'Order not found!',
                success: false
            });
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
