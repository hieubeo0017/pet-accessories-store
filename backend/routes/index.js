const express = require('express');
const authRoutes = require('./auth');
const cartRoutes = require('./cart');
const orderRoutes = require('./orders');
const productRoutes = require('./products');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);

module.exports = {
    API: router
};

