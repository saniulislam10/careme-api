const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    purchaseId: {
        type: String,
        required: false,
        unique: true,
    },
    reference: {
        type: String,
        required: false
    },
    dateTime: {
        type: Date,
        required: false
    },
    supplier: {
        type: String,
        required: false
    },
    manufacturer: {
        type: String,
        required: false
    },
    supplier_link: {
        type: String,
        required: false
    },
    supplier_reference: {
        type: String,
        required: false
    },
    products: [],
    purchaseShippingCharge: {
        type: Number,
        required: false
    },
    purchaseShippingCharge: {
        type: Number,
        required: false
    },
    status: {
        type: Number,
        required: false
    },
    adjustmentPrice: {
        type: Number,
        required: false
    },
    comments: {
        type: String,
        required: false
    },
    subTotal: {
        type: Number,
        required: false
    },
    totalAmount: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Purchase', schema);
