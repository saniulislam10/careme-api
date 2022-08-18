const express = require('express');

// Imports
const controller = require('../controller/bulk-sms');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/bulk-sms
 */

router.post('/send-bulk-sms', controller.sendBulkSms);


// Export router class..
module.exports = router;
