const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require("./sub-schema-model");

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    chooseProduct: {
        type: String,
        required: false
    },
    selectedCategories: [],
    selectedZones: [],
    shippingMethods: []

}, {
    timestamps: true
});


module.exports = mongoose.model('ShippingProfile', schema);
