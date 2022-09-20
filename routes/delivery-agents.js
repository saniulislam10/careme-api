// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/delivery-agents');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/admin/registration
 */

// Add
router.post('/update-status', controller.updateStatus);


// Export All router..
module.exports = router;
