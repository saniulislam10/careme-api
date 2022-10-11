const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require('./sub-schema-model');

const schema = new Schema(
    {
        returnId: {
            type: String,
            required: true,
        },
        orderNumber: {
            type: String,
            required: true,
        },
        returnDate: {
            type: Date,
            required: true
        },
        invoiceId: {
            type: String,
            required: true,
        },
        customerName: {
            type: String,
            required: false
        },
        shippingAddress: {
            type: String,
            required: false
        },
        subTotal: {
            type: Number,
            required: false
        },
        adjustment: {
            type: Number,
            required: false
        },
        deliveryFee: {
            type: Number,
            required: false
        },
        total: {
            type: Number,
            required: false
        },
        products: [],
        refundEligible : {
            type: Boolean,
            required: false
        },
        reason : {
            type: String,
            required: false
        } , 
        images : [{
            type: String,
            required: false
        }]  
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Return', schema);
