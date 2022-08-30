// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/admin');
const inputValidator = require('../validation/admin');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/admin/registration
 */



// CREATE

router.post('/registration', controller.adminSignUp);
router.put('/login', controller.adminLogin);

// READ
router.get('/get-logged-in-admin-info',checkIpWhitelist, checkAdminAuth, controller.getLoginAdminInfo);
router.get('/get-logged-in-admin-role', checkAdminAuth, controller.getLoginAdminRole);
router.get('/get-all-admin-list', checkAdminAuth, controller.getAdminLists);
router.get('/get-single-admin-by-id/:id', controller.getSingleAdminById);
// UPDATE
router.put('/edit-logged-in-admin-info',checkIpWhitelist, checkAdminAuth, controller.editAdminOwnProfileInfo);
router.put('/change-logged-in-admin-password',checkIpWhitelist, checkAdminAuth, controller.changeAdminOwnPassword);
router.put('/edit-admin-info/:id',checkIpWhitelist, checkAdminAuth, controller.editAdmin);
router.post('/update-admin-images',checkIpWhitelist, checkAdminAuth, controller.updateAdminImageField);
// DELETE
router.delete('/delete-admin-by-id/:id',checkIpWhitelist, checkAdminAuth, controller.deleteAdminById);

// DEFAULT DATA
router.post('/add-default-data', controller.insertDefaultDocuments);

// Role
router.post('/add-admin-role',checkIpWhitelist, controller.addAdminRole);
router.get('/get-all-admin-roles', checkAdminAuth, controller.getRolesData);
router.get('/get-admin-role-by-id/:id', checkAdminAuth, controller.getSingleRoleById);
router.put('/edit-admin-role',checkIpWhitelist, checkAdminAuth, controller.editAdminRole);
router.delete('/delete-admin-role-by-id/:id',checkIpWhitelist, checkAdminAuth, controller.deleteAdminRoleById);

// Customers
router.post('/get-all-customers', checkIpWhitelist, checkAdminAuth, controller.getAllCustomers)
router.post("/get-selected-user-details",controller.getSelectedUserDetails);

// Export All router..
module.exports = router;
