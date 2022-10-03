const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    refundId: {
        type: String,
        required: true
    },
    returnId: {
        type: String,
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    customerName: {
        type: String,
        required: false
    },
    products: [],
    paymentBy: {
        type: String,
        required: true
    },
    paymentOptions: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});


module.exports = mongoose.model('Refund', schema);
