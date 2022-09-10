const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require('./sub-schema-model')

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: false
        },
        age: {
            type: Number,
            required: false
        },
        zilla: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        thana: {
            type: String,
            required: false
        },
        zipcode: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        },
        phoneNo: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: false
        },
        district: {
            type: String,
            required: false
        },
        area: {
            type: String,
            required: false
        },
        shippingAddress: {
            type: String,
            required: false
        },
        gender: {
            type: String,
            required: false
        },
        birthdate: {
            type: Date,
            required: false
        },
        username: {
            type: String,
            required: false
        },
        status: {
            type: Number,
            required: false
        },
        occupation: {
            type: String,
            required: false
        },
        profileImg: {
            type: String
        },
        password: {
            type: String,
            required: false
        },
        isPhoneVerified: {
            type: Boolean,
            required: false
        },
        isEmailVerified: {
            type: Boolean,
            required: false
        },
        registrationType: {
            type: String,
            required: false
        },
        registrationAt: {
            type: String,
            // default: Date.now(),
            required: false,
        },
        hasAccess: {
            type: Boolean,
            required: false
        },
        carts: [{
            type: Schema.Types.ObjectId,
            ref: 'Cart'
        }],
        checkouts: [{
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }],
        prescriptionOrders: [{
            type: Schema.Types.ObjectId,
            ref: 'PrescriptionOrder'
        }],
        addresses: [{
            type: Schema.Types.ObjectId,
            ref: 'Address'
        }],
        wishlists: [{
            type: Schema.Types.ObjectId,
            ref: 'Wishlist'
        }],
        usedCoupons: [{
            type: Schema.Types.ObjectId,
            ref: 'Coupon'
        }],
        points: {
            type: Number,
            required: false
        },
        redeemedPoints: {
            type: Number,
            required: false
        },
        earnedPoints: {
            type: Number,
            required: false
        },
        totalReturn: {
            type: Number,
            required: false
        },
        totalReturnAmount: {
            type: Number,
            required: false
        },
        tag:[subSchema.tagStatus],
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('User', userSchema);
