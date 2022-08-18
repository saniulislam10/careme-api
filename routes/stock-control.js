const express = require('express');

// Imports
const controller = require('../controller/stock-control');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/expense
 * http://localhost:5502/api/stock-control
 */
// CREATE
router.post('/add-new-stock-control', checkAdminAuth, controller.addNewStockControl);
// READ
router.get('/get-stock-control', checkAdminAuth, controller.getStockControl);
// UPDATE
router.post('/update-stock-control', checkAdminAuth, controller.updateStockControl);
// DELETE


 module.exports = router;