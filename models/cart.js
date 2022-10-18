const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: false
        },
        name: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: false
        },
        price: {
            type: String,
            required: false
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
        isSelected: {
            type: Boolean,
            required: false,
            default:true
        },
        requestProduct: {
            type: Boolean,
            required: false
        },

        variant: [],

        address : {
            type: Schema.Types.ObjectId,
            ref: 'Address',
            required: false
        },

        link : {
            type: String,
            required: false
        },
        deliveryDateFrom: {
            type: String,
            required: false
        },
        deliveryDateTo: {
            type: String,
            required: false
        },
        vendor : {
            type: String,
            required: false 
        }
    },
    {
        timestamps: true
    },
    {
        strict: false
    }
);

module.exports = mongoose.model('Cart', schema);
