const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    canPartialPayment: {
        type: Boolean,
        required: true
    },
    canStockControl: {
        type: Boolean,
        required: true
    },
    allowPoints: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Vendor', schema);
