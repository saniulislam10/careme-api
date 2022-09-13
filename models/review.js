const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    orderNo: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Review', schema);
