const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.orderedItems = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        slug: {
            type: String,
            required: false,
        },
        price: {
            type: Number,
            required: false,
        },
        image: {
            type: String,
            required: false,
        },
        sku: {
            type: String,
            required: false,
        },
        quantity: {
            type: Number,
            required: false,
        },
        invoicedQuantity: {
            type: Number,
            required: false,
        },
        returnedQuantity: {
            type: Number,
            required: false,
        },
        tax: {
            type: Number,
            required: false,
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: false,
        },
        vendorName: {
            type: String,
            required: false,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
            required: false,
        },
        brandName: {
            type: String,
            required: false,
        },
        productTypeId: {
            type: String,
            required: false,
        },
        productTypeName: {
            type: String,
            required: false,
        },
        orderType: {
            type: String,
            required: false,
        },
        variant: {
            type: String,
            required: false,
        },
        advanceType: {
            type: Number,
            required: false,
        },
        advanceAmount: {
            type: Number,
            required: false,
        },
        deliveryStatus: {
            type: Number,
            required: false,
        },
        deliveryDateFrom: {
            type: Date,
            required: false,
        },
        deliveryDateTo: {
            type: Date,
            required: false,
        },
        paymentStatus: {
            type: Number,
            required: false,
        },
        paidAmount: {
            type: Number,
            required: false,
        },
        paymentMethod: {
            type: String,
            required: false,
        },
        shippingFee: {
            type: Number,
            required: false,
        },
        returnPeriod: {
            type: Number,
            required: false,
        },
        earnedAmount: {
            type: Number,
            required: false,
        },
        redeemedAmount: {
            type: Number,
            required: false,
        },
        
    },
    {
        _id: true
    }
);
exports.orderStatus = new Schema({
    status: {
        type: String,
        required: true
    },
    adminInfo: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: false
    },
    statusNote: {
        type: String,
        required: false
    },
    sku: {
        type: String,
        required: false
    },

})


exports.tagStatus = new Schema({
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        required: false
    },
    activationdate: {
        type: String,
        required: true
    }
},
    {
        _id: true
    })