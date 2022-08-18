const express = require('express');
var cors = require('cors');

// Created Require Files..
const controller = require('../controller/search');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/search
 */

/* 
* Scrapping READ Api
*/
 router.get('/get-aliexpress-product-data/:id', controller.getAliexpressProductData);
 router.get('/get-amazon-product-data/:id', controller.getAmazonProductData);
 router.get('/get-amazon-india-product-data/:id', controller.getAmazonIndiaProductData);
 router.get('/get-walmart-product-data/:id', controller.getWalmartProductData);

 router.post('/get-product-from-aliexpress', controller.getProductFromAliexpress);
 router.post('/get-product-from-amazon', controller.getProductFromAmazon);
 router.post('/get-product-from-amazon-manual', controller.getProuductFromAmazonManual);
 router.post('/get-product-from-flipkart', controller.getProductFromFlipkart);
 router.post('/get-product-from-myntra', controller.getProductFromMyntra);
 router.post('/get-product-from-ebay', controller.getProductFromEbay);
 router.post('/get-product-from-walmart', controller.getProductFromWalmart);

 // Scrapping Order (CREATE, READ) apis
 router.post('/post-order', controller.postOrder);
 router.get('/get-all-orders', controller.getAllOrders);
 router.get('/get-order-by-id/:id', controller.getOrderById);


 // Export All router..
module.exports = router;





