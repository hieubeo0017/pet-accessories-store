const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Route to get the cart
router.get('/', cartController.getCart);

// Route to add an item to the cart
router.post('/add', cartController.addToCart);

// Route to remove an item from the cart
router.delete('/remove/:itemId', cartController.removeFromCart);

// Route to clear the cart
// router.delete('/clear', cartController.clearCart);

module.exports = router;