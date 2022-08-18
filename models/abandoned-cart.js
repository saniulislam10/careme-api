const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        abandonedId: {
            type: String,
            required: false,
            unique: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        selectedQty: {
            type: Number,
            required: false
        },
        variant: [],
        address : {
            type: Schema.Types.ObjectId,
            ref: 'Address',
            required: false
        },
    },
    {
        timestamps: true
    },
    {
        strict: false
    }
);

module.exports = mongoose.model('AbandonedCart', schema);
