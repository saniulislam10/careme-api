const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require("./sub-schema-model");

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    customOpeningTime: {
        type: Boolean,
        required: false
    },
    openingTimesArray: [
        subSchema.openingTime
    ],
    productTypeInStock: {
        type: Boolean,
        required: true
    },
    productTypePreOrder: {
        type: Boolean,
        required: true
    },
    inStockDeliveryOption: {
        type: String,
        required: true
    },
    inStockDeliveryCustomRange: {
        type: Boolean,
        required: true
    },
    inStockDeliveryFrom: {
        type: Number,
        required: false
    },
    inStockDeliveryTo: {
        type: Number,
        required: false
    },
    inStockDeliveryTimesArray: [
        subSchema.timeRange
    ],
    bufferTime: {
        type: Number,
        required: false
    },
    preOrderDeliveryOption:{
        type: String,
        required: false
    },
    preOrderDeliveryFrom: {
        type: Number,
        required: false
    },
    preOrderDeliveryTo: {
        type: Number,
        required: false
    },
    preOrderDeliveryCustomRange: {
        type: Boolean,
        required: true
    },
    allProductEnable: {
        type: Boolean,
        required: true
    },
    catEnable: {
        type: Boolean,
        required: true
    },
    productEnable: {
        type: Boolean,
        required: true
    },
    categoryArray: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductType',
        required: false
    }],
    allProductProfile: {
        type: Schema.Types.ObjectId,
        ref: 'ShippingProfile',
        required: false
    },
    

}, {
    timestamps: true
});


module.exports = mongoose.model('Shipping', schema);
