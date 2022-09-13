// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/review');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/admin/registration
 */

// Add
router.post('/add', controller.add);
const checkAuth = require('../middileware/check-user-auth');

// READ
router.get('/get-all', controller.getAll);
router.get('/get-all-by-user', checkAuth, controller.getAllByUser);
router.put('/edit-by-id', controller.editById);
router.post('/get-filtered-data', controller.getFilteredData);


// Export All router..
module.exports = router;
