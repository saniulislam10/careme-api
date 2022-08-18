const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: false
    },
    images: {
        type: Object,
        required: false
    },
    aboutThis: {
        type: Object,
        required: false
    },
    description: {
        type: String,
        required: false,
    },
    feedback: {
        type: Object,
        required: false
    },
    totalAvailableQuantity: {
        type: Number,
        required: false
    },
    salePrice : {
        type: Object,
        required: false
    },
    specs: {
        type: Object,
        required: false
    },
    variants: {
        type: Object,
        required: false
    },
    ratings: {
        type: Object,
        required: false
    },
    link: {
        type: String,
        required: false
    },
    firstVariant: {
        type: String,
        required: false
    },
    secondVariant: {
        type: String,
        required: false
    },
    thirdVariant: {
        type: String,
        required: false
    },
    fourthVariant: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
}, {
    timestamps: true,
    versionKey: false
});


module.exports = mongoose.model('requestProduct', schema);