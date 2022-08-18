// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/product-category');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');
const router = express.Router();

/**
 * http://localhost:5502/api/product-category
 */

// Create
router.post('/add-category',checkIpWhitelist,checkAdminAuth, controller.addCategory);
router.post('/add-multiple-category',checkIpWhitelist,checkAdminAuth, controller.insertManyCategory);
// Read
router.get('/get-all-categories', controller.getAllCategory);
router.post('/get-categories-by-dynamic-sort', controller.getCategorysByDynamicSort);
router.get('/get-category-by-category-id/:categoryId', controller.getCategoryByCategoryId);
router.post('/get-categories-by-search', controller.getCategoriesBySearch);
router.get('/get-category-by-category-slug/:categorySlug', controller.getCategoryByCategorySlug);
// Update
router.put('/edit-category-by-category',checkIpWhitelist,checkAdminAuth, controller.editCategoryData);
// Delete
router.delete('/delete-category-by-id/:categoryId',checkIpWhitelist,checkAdminAuth, controller.deleteCategoryByCategoryId);

// Export All router..
module.exports = router;
