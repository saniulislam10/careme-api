const express = require('express');

// Imports
const controller = require('../controller/return');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/invoice
 */

// CREATE
router.post('/place-return', controller.addReturn);
// READ
router.get('/get-all-returns-by-orderNo/:id', checkAdminAuth, controller.getAllReturnsByOrderNo);
router.get('/get-all-returns-by-invoiceId/:id', checkAdminAuth, controller.getAllReturnsByInvoiceId);
router.post('/get-all-returns', checkAdminAuth, controller.getAllReturns);
router.post('/get-return-by-search', checkAdminAuth, controller.getBySearch);
router.get('/get-return-by-id/:id', checkAdminAuth, controller.getReturnById);
router.put('/update-return-by-id/:id', checkAdminAuth, controller.updateReturnById);
router.put('/recieve-return-by-id/:id', checkAdminAuth, controller.recieveReturnById);
// UPDATE
// DELETE



// Export router class..
module.exports = router;
