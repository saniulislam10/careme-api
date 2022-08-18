const express = require('express');

// Imports
const controller = require('../controller/gallery');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');


// Get Express Router Function..
const router = express.Router();

/**
 * /api/gallery
 * http://localhost:5502/api/gallery
 */

// CREATE
router.post('/add-new-gallery',checkAdminAuth, controller.addNewGalleryImage);
router.post('/add-new-gallery-multi',checkAdminAuth, controller.addNewGalleryMultiImage);
// READ
router.get('/get-all-gallery-list',checkAdminAuth, controller.getAllGalleryImage);
router.get('/get-gallery-details-by-id/:id',checkAdminAuth, controller.getSingleGalleryImageById);
router.get('/search-image-by-regex', controller.getSearchImageByRegex);
// UPDATE
router.put('/edit-gallery-by-id',checkAdminAuth, controller.editGalleryImageData);
// DELETE
router.delete('/delete-gallery-by-id/:id',checkAdminAuth, controller.deleteGalleryImageById);
router.post('/delete-gallery-images-multi',checkAdminAuth, controller.deleteGalleryImageMulti);


// Export router class..
module.exports = router;
