const express = require('express');

// Imports
const controller = require('../controller/tag');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/expense
 * http://localhost:5502/api/size-chart
 */

// CREATE
router.post('/add-new-tag', controller.addTag);
// READ
router.get('/get-all-tags', controller.getAllTags);
// UPDATE
// DELETE
 router.delete('/delete-tag/:tagId', controller.deleteTag);


 module.exports = router;