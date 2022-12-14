// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/user');
const inputValidator = require('../validation/user');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');

const router = express.Router();

/**
 * /api/user
 * http://localhost:5502/api/user
 */


router.post('/registration', controller.userRegistrationDefault);
router.put('/login', controller.userLoginDefault);
router.post('/firebase-login', controller.userFirebaseAuth);
router.get('/logged-in-user-data', checkAuth, controller.getLoginUserInfo);
router.put('/edit-logged-in-user-data', controller.editLoginUserInfo);
router.get('/check-user-by-phone/:phoneNo', controller.checkUserByPhone);
router.post('/get-all-user-lists', checkAdminAuth, controller.getUserLists);
router.get('/get-user-by-user-id/:userId', checkAdminAuth, controller.getUserByUserId);

// Password
router.post('/edit-password',checkAuth, controller.editPassword);
router.post('/update-password', checkAuth, controller.updatePassword);

// ADDRESS
router.post('/add-address',checkAuth, checkAuth, controller.addAddress);
router.get('/get-addresses', checkAuth, controller.getAddresses);
router.put('/edit-address', checkAuth, controller.editUserAddress);
router.delete('/delete-address-by-id/:id', checkAuth, controller.deleteUserAddress);

// ADMIN
router.put('/edit-user-access/:id', controller.editUserAccess);

// SEARCH
router.post('/get-users-by-search', controller.getUsersBySearch);


// Export All router..
module.exports = router;
