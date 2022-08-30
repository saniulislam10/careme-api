// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/purchase');

// Get Express Router Function..
const router = express.Router();

/**
 * /api/product
 * http://localhost:5502/api/purchase
 */


// CREATE
router.post('/add', controller.addSingle);

// READ
router.get('/get/:id', controller.getById);
router.post('/get-all', controller.getAll);

// UPDATE
router.put('/edit', controller.updateById);
router.put('/edit-recieved', controller.updateRecieved);

// DELETE
router.delete('/delete/:id', controller.deleteById);


// Export All router..
module.exports = router;
