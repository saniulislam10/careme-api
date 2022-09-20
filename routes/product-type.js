// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/product-type');
const inputValidator = require('../validation/admin');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/admin/registration
 */

// Add
router.post('/add', checkAdminAuth, controller.add);

// READ
router.get('/get-all', checkAdminAuth, controller.getAll);
router.put('/edit-by-id', controller.editById);
router.post('/get-filtered-data', controller.getFilteredData);
router.delete('/delete-by-id/:id', checkAdminAuth, controller.deleteById);


// Export All router..
module.exports = router;
