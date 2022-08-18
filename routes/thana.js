// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/thana');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

const router = express.Router();

/**
 * /thana
 * http://localhost:3000/api/thana

 */
router.post('/add-thana',checkIpWhitelist,checkAdminAuth, controller.addThana);
router.get('/get-all-thana', controller.getAllThana);
router.get('/get-thana-by-thana-id/:thanaId', controller.getThanaByThanaId);
router.get('/get-all-thanas-by-city-id/:cityId', controller.getAllThanasByCityId);

router.put('/edit-thana-by-thana',checkIpWhitelist,checkAdminAuth, controller.editThanaData);
router.delete('/delete-thana-by-id/:thanaId',checkIpWhitelist,checkAdminAuth, controller.deleteThanaByThanaId);

// Export All router..
module.exports = router;