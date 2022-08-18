const express = require('express');

// Imports
const controller = require('../controller/image-folder');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

/**
 * http://localhost:5502/api/image-folder
 */

// CREATE
router.post('/add-new-image-folder', controller.addNewImageFolder);
router.post('/add-new-image-folder-multi',checkAdminAuth, controller.addNewImageFolderMulti);
// READ
router.get('/get-all-image-folder-list',checkAdminAuth, controller.getAllImageFolder);
router.get('/get-image-folder-details-by-id/:id',checkAdminAuth, controller.getSingleImageFolderById);
// UPDATE
router.put('/edit-image-folder-by-id',checkAdminAuth, controller.editImageFolderData);
// DELETE
router.delete('/delete-image-folder-by-id/:id',checkAdminAuth, controller.deleteImageFolderById);
router.post('/delete-image-folder-images-multi',checkAdminAuth, controller.deleteImageFolderMulti);


// Export router class..
module.exports = router;
