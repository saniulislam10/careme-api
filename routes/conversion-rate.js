/** @format */

const express = require("express");

// Imports
const controller = require("../controller/conversion-rate");
const checkAdminAuth = require("../middileware/check-admin-auth");
const checkIpWhitelist = require("../middileware/check-ip-whitelist");

// Get Express Router Function..
const router = express.Router();

/**
 * /api/expense
 * http://localhost:5502/api/size-chart
 */

// CREATE
router.post("/add-conversion-rate", controller.addConversionRate);
// READ
router.get("/get-all-conversion-rate", controller.getAllConversionRate);
router.get("/get-single-conversion-rate-by-id/:id", controller.getSingleConversionRateById);
router.post("/get-specific-conversion-rate-by-url",  controller.getSpecificConversionRateBycatId);

// UPDATE
router.put("/edit-conversion-rate", checkAdminAuth,controller.editConversionRate);
// DELETE
router.delete("/delete-conversion-rate/:conversionRateId", controller.deleteConversionRate);

module.exports = router;
