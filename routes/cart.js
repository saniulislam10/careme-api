const express = require('express');

// Imports
const controller = require('../controller/cart');
const checkAuth = require('../middileware/check-user-auth');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/cart
 */

// CREATE
router.post('/add-to-cart', checkAuth, controller.addToCart);
// READ
router.get('/get-cart-items-by-user', checkAuth, controller.getCartItemByUserId);
router.get('/get-cart-item-type', checkAuth, controller.getCartItemTypeByUserId);
router.get('/cart-item-count', checkAuth, controller.getCartItemCount);
router.get('/get-status-book-on-cart/:bookId', checkAuth, controller.getSingleCartProduct);
// UPDATE
router.put('/edit-variant-in-cart', checkAuth, controller.editVariantInCart);
router.post('/increment-cart-item-quantity', checkAuth, controller.incrementCartQty);
router.post('/update-cart', checkAuth, controller.updateCart);
router.post('/update-cart-multiple', checkAuth, controller.updateCartMultiple);
router.post('/decrement-cart-item-quantity', checkAuth, controller.decrementCartQty);
// DELETE
router.delete('/remove-cart-item/:cartId', checkAuth, controller.deleteCartItem);
router.delete('/delete-user-cart-list', checkAuth, controller.deleteUserCartList);

// Abandoned Cart
router.post('/add-to-abandoned-cart', controller.addToAbandonedCart);
router.get('/get-all-abandoned-cart', controller.getAllAbandonedCart);


// Export router class..
module.exports = router;

