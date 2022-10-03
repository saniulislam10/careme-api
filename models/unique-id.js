const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
        orderId: {
            type: Number,
            required: false
        },
        orderTempId: {
            type: Number,
            required: false
        },
        invoiceId: {
            type: Number,
            required: false
        },
        returnId: {
            type: Number,
            required: false
        },
        abandonedId: {
            type: Number,
            required: false
        },
        requestId: {
            type: Number,
            required: false
        },
        purchaseId: {
            type: Number,
            required: false
        },
        adjustmentId: {
            type: Number,
            required: false
        },
        refundId: {
            type: Number,
            required: false
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = mongoose.model('UniqueId', schema);
