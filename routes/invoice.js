const express = require('express');

// Imports
const controller = require('../controller/invoice');
const checkAdminAuth = require('../middileware/check-admin-auth');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/invoice
 * http://localhost:5502/api/invoice
 */

// CREATE
router.post('/place-invoice', checkAdminAuth, controller.addInvoice);

//READ
router.post('/get-all-invoices-by-orderNo', controller.getAllInvoicesByOrderNo);
router.post('/get-all-invoices', checkAdminAuth, controller.getAllInvoices);
router.post('/get-invoices-by-search', checkAdminAuth, controller.getInvoicesBySearch);
router.get('/get-invoice-by-id/:id', checkAdminAuth, controller.getInvoiceById);


// Export router class..
module.exports = router;
