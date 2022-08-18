const express = require('express');

// Imports
const controller = require('../controller/size-chart');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/expense
 * http://localhost:5502/api/size-chart
 */

// CREATE
router.post('/add-new-size-chart', controller.addNewSizeChart);
// READ
router.post('/get-all-size-chart',controller.getAllSizeChart);
router.get('/get-size-chart-by-parent-id/:id',controller.getSizeChartByParentId);
router.post('/get-products-by-category-and-sub-category-id', controller.getSizeChartByCategoryAndSubCategoryId);
// UPDATE
router.put('/edit-new-size-chart', controller.editNewSizeChart);
// DELETE
 router.delete('/delete-size-chart/:sizeChartId', controller.deleteSizeChart);


 module.exports = router;