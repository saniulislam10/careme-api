const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require('./sub-schema-model');

const schema = new Schema(
    {
        orderId: {
            type: String,
            required: false,
            unique: true
        },
        checkoutDate: {
            type: Date,
            required: false
        },

        deliveryDate: {
            type: Date,
            required: false
        },

        deliveryStatus: {
            type: Number,
            required: false
        },

        // Amount Area
        subTotal: {
            type: Number,
            required: false
        },
        shippingFee: {
            type: Number,
            required: false
        },
        discount: {
            type: Number,
            required: false
        },
        redeemAmount: {
            type: Number,
            required: false
        },
        paidAmount: {
            type: Number,
            required: false
        },
        totalAmount: {
            type: Number,
            required: false
        },
        totalAmountWithDiscount: {
            type: Number,
            required: false
        },
        deletedProduct: {
            type: Boolean,
            required: false
        },
        refundAmount: {
            type: Number,
            required: false
        },
        paymentMethod: {
            type: String,
            required: false
        },

        paymentStatus: {
            type: Number,
            required: false
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },

        // User Address
        address: {
            type: Schema.Types.ObjectId,
            ref: 'Address',
        },
        name: {
            type: String,
            required: false
        },
        phoneNo: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        alternativePhoneNo: {
            type: String,
            required: false
        },
        city: {
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

        // Coupon
        couponId: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            required: false
        },
        couponValue: {
            type: Number,
            required: false
        },
        orderStatusTimeline:[
            subSchema.orderStatus
        ],
        orderTimeline: {
            others: {
                type: Boolean,
                required: false
            },
            othersData: {
                type: Date,
                required: false
            },
            orderPlaced: {
                type: Boolean,
                required: false
            },
            orderPlacedDate: {
                type: Date,
                required: false
            },
            orderProcessing: {
                type: Boolean,
                required: false
            },
            orderProcessingDate: {
                type: Date,
                required: false
            },
            orderPickedByDeliveryMan: {
                type: Boolean,
                required: false
            },
            orderPickedByDeliveryManDate: {
                type: Date,
                required: false
            },
            orderDelivered: {
                type: Boolean,
                required: false
            },
            orderDeliveredDate: {
                type: Date,
                required: false
            },
        },
        comments:[{
            type:String,
            required:false,
        }],
        // Order Type
        hasPreorderItem: {
            type: Boolean,
            required: false
        },
        orderedItems: [],
        requestOrder: {
            type: Boolean,
            required: false
        },
        orderNotes: {
            type: String,
            required: false
        },
        sessionkey: {
            type: String,
            required: false
        },
        orderPaymentInfo: {
            type: Schema.Types.ObjectId,
            ref: "OrderPaymentInfo",
            required: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('requestOrder', schema);
