const express = require('express');

// Imports
const controller = require('../controller/order');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/order
 */

/**
 * Request Order
 */

router.post('/place-order-request', checkAuth, controller.placeOrderForRequest);
router.get('/get-request-order-details/:id', controller.getRequestOrderDetailsById);
router.post('/get-all-request-orders-by-admin',checkIpWhitelist, checkAdminAuth, controller.getAllRequestOrdersByAdmin);
router.put('/update-request-order-by-id', controller.updateRequestOrderById);

/**
 * Regular Order
 */
router.post('/edit-order', checkAuth, controller.editOrder);
router.post('/place-order', checkAuth, controller.placeOrder);
router.post('/update-order', checkAuth, controller.updateOrder);
router.post('/place-temp-order', checkAuth, controller.placeTempOrder);
router.get('/get-all-orders-by-user', checkAuth, controller.getAllOrdersByUser);
router.get('/get-orders-by-user-orderId', checkAuth, controller.getOrderByUserOrderId);
router.get('/get-all-orders-of-user-by-admin',checkAuth,controller.getAllOrdersOfUserByAdmin);
router.get('/get-order-details/:id', controller.getOrderDetailsById);
router.get('/get-all-transactions-by-user', checkAuth, controller.getAllTransactionByUser);
router.get("/get-single-order-by-user/:orderId", checkAuth, controller.getSingleOrderByUser);
router.get("/get-single-order-by-user-admin/:orderId",checkIpWhitelist, checkAdminAuth, controller.getSingleOrderByUser);
router.put('/cancel-order-by-user/:orderId', checkAuth, controller.cancelOrderByUser);
router.post('/get-order-by-search', controller.getOrdersBySearch);
router.put('/update-multiple-order-by-id', checkIpWhitelist,checkAdminAuth, controller.updateMultipleOrder);


/**
 * ADMIN
 */

// CREATE

// READ
router.get('/get-single-order-by-admin/:orderId',checkIpWhitelist, checkAdminAuth, controller.getSingleOrderByAdmin);
router.post('/get-all-orders-by-admin',checkIpWhitelist, checkAdminAuth, controller.getAllOrdersByAdmin);
router.get('/get-all-orders-by-userId/:userId',checkIpWhitelist, checkAdminAuth, controller.getUserOrdersByAdmin);
router.get('/get-all-orders-by-admin-no-paginate',checkIpWhitelist, checkAdminAuth, controller.getAllOrdersByAdminNoPaginate);
router.post('/get-orders-by-filter-data/:deliveryStatus',checkIpWhitelist, checkAdminAuth, controller.filterByDynamicFilters);
router.get('/get-all-canceled-orders',checkIpWhitelist, checkAdminAuth, controller.getAllCanceledOrdersByAdmin);
router.post('/get-orders-by-date-range-data/:startDate/:endDate',checkIpWhitelist, checkAdminAuth, controller.filterByDateRange);
router.post('/get-selected-order-details',checkAdminAuth,controller.getSelectedOrderDetails)


// bulk sms
router.get('/sent-test-ssl-message', controller.testSslSmsApi);

// transaction
router.get('/get-all-transaction-by-admin',checkIpWhitelist, checkAdminAuth, controller.getAllTransactionByAdmin);

// UPDATE
router.put('/change-order-status',checkIpWhitelist, checkAdminAuth, controller.changeDeliveryStatus);
router.put('/update-order-by-id', controller.updateOrderById);

// DELETE
router.delete('/delete-order-by-admin/:orderId',checkIpWhitelist, checkAdminAuth, controller.deleteOrderByAdmin);

// ssl
router.post('/update-session-key/:tranId/:sessionkey', controller.updateSessionKey);


// Export router class..
module.exports = router;
