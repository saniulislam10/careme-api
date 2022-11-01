// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/city');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

const router = express.Router();

/**
 * /city
 * http://localhost:3000/api/city
 */


router.post('/add-city',checkIpWhitelist,checkAdminAuth, controller.addCity);
router.get('/get-all-city', controller.getAllCity);
router.get('/get-city-by-city-id/:cityId', controller.getCityByCitytId);
router.get('/get-city-by-zila-id/:zilaId', controller.getAllCityByZilaId);
// router.get('/get-city-count/:zilaId', controller.getAllCityCount);
router.put('/edit-city-by-city',checkIpWhitelist,checkAdminAuth, controller.editCityData);
router.delete('/delete-city-by-id/:cityId',checkIpWhitelist,checkAdminAuth, controller.deleteCityByCityId);

// Export All router..
module.exports = router;