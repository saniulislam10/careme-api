const express = require('express');

// Imports
const controller = require('../controller/category-menu');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');
// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/category-menu
 */

// CREATE
router.post('/add-new-category-menu',checkIpWhitelist,checkAdminAuth, controller.addNewCategoryMenu);
// READ
router.get('/get-all-category-menu', controller.getAllCategoryMenu);
router.get('/get-category-menu-by-id/:id', controller.getCategoryMenuById);
// UPDATE
router.put('/update-category-menu-item',checkIpWhitelist,checkAdminAuth, controller.updateCategoryMenu);
// DELETE
router.delete('/delete-category-menu-by-id/:id',checkIpWhitelist,checkAdminAuth, controller.deleteCategoryMenuById);


// Export router class..
module.exports = router;
