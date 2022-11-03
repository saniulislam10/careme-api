// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/shipping');
const inputValidator = require('../validation/admin');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/admin/registration
 */

// Add
router.post('/add', controller.add);
router.get('/get-all', controller.getAll);
router.put('/edit', controller.editById);
router.post('/get-filtered-data', controller.getFilteredData);
router.delete('/delete-by-id/:id', checkAdminAuth, controller.deleteById);

router.post('/add-profile', controller.addProfile);
router.put('/edit-profile', controller.editProfile);
router.get('/get-all-profile', controller.getAllProfile);
router.get('/get-profile-by-id/:id', controller.getProfileById);
router.delete('/delete-profile-by-id/:id', checkAdminAuth, controller.deleteProfileById);

// Export All router..
module.exports = router;
