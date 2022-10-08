// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/purchase');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/product
 * http://localhost:5502/api/purchase
 */


// CREATE
router.post('/add', checkAdminAuth, controller.addSingle);

// READ
router.get('/get/:id', checkAdminAuth, controller.getById);
router.post('/get-all', checkAdminAuth, controller.getAll);
router.post('/get-by-search', controller.getBySearch);

// UPDATE
router.put('/edit', checkAdminAuth, controller.updateById);
router.put('/edit-recieved', checkAdminAuth, controller.updateRecieved);

// DELETE
router.delete('/delete/:id', checkAdminAuth, controller.deleteById);


// Export All router..
module.exports = router;
