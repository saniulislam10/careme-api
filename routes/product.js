// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/product');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/product
 * http://localhost:5502/api/product
 */


// CREATE
router.post('/add-single-product', controller.addSingleProduct);

// READ
router.get('/get-single-product-by-id/:id', controller.getSingleProductById);
router.get('/get-single-product-by-slug/:slug', controller.getSingleProductBySlug);
router.post('/get-all-products', controller.getAllProducts);
router.post('/get-all-archived-products', controller.getAllArchivedProducts);
router.post('/get-products-by-dynamic-sort', controller.getProductsByDynamicSort);
router.post('/get-products-by-search',controller.getProductsBySearch)
router.post("/get-selected-product-details",controller.getSelectedProductDetails);
router.post('/get-specific-products-by-cat-id',controller.getSpecificProductsBycatId)
router.post('/get-specific-products-by-sub-cat-id',controller.getSpecificProductsBySubCatId)
// add-by-link
router.post('/get-add-by-link-products-by-dynamic-sort', controller.getAddByLinkProductsByDynamicSort);

// UPDATE
router.put('/edit-product-by-id', controller.updateProductById);
router.post('/update-multiple-product-by-id',controller.updateMultipleProductById);
router.post('/update-product-quantity-by-id',controller.updateProductQuantityById);

// DELETE
router.delete('/delete-product-by-id/:id', controller.deleteProductById);


// Export All router..
module.exports = router;
