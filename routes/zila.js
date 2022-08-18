// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/zila');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

const router = express.Router();

/**
 * /district
 * http://localhost:3000/api/district
 */


router.post('/add-zila', controller.addZila);
router.get('/get-all-zila', controller.getAllZila);
router.get('/get-zila-by-zila-id/:zilaId', controller.getZilaByzilaId);
router.put('/edit-zila-by-zila',checkIpWhitelist,checkAdminAuth, controller.editZilaData);
router.delete('/delete-zila-by-id/:zilaId',checkIpWhitelist,checkAdminAuth, controller.deleteZilaByZilaId);

// Export All router..
module.exports = router;