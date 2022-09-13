const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subSchema = require("./sub-schema-model");

const schema = new Schema(
  {
    orderId: {
      type: String,
      required: false,
      unique: true,
    },
    checkoutDate: {
      type: Date,
      required: false,
    },

    

    deliveryStatus: {
      type: Number,
      required: false,
    },

    // Amount Area
    subTotal: {
      type: Number,
      required: false,
    },
    shippingFee: {
      type: Number,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
    },
    redeemAmount: {
      type: Number,
      required: false,
    },
    paidAmount: {
      type: Number,
      required: false,
    },
    totalAmount: {
      type: Number,
      required: false,
    },
    totalAmountWithDiscount: {
      type: Number,
      required: false,
    },

    deletedProduct: {
      type: Boolean,
      required: false,
    },
    refundAmount: {
      type: Number,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false,
    },

    paymentStatus: {
      type: Number,
      required: false,
    },

    // user
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    name: {
      type: String,
      required: false,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    alternativePhoneNo: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    area: {
      type: String,
      required: false,
    },
    shippingAddress: {
      type: String,
      required: false,
    },

    // Coupon
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    couponValue: {
      type: Number,
      required: false,
    },

    orderStatusTimeline: [subSchema.orderStatus],

    orderTimeline: {
      others: {
        type: Boolean,
        required: false,
      },
      othersData: {
        type: Date,
        required: false,
      },
      orderPlaced: {
        type: Boolean,
        required: false,
      },
      orderPlacedDate: {
        type: Date,
        required: false,
      },
      orderProcessing: {
        type: Boolean,
        required: false,
      },
      orderProcessingDate: {
        type: Date,
        required: false,
      },
      orderPickedByDeliveryMan: {
        type: Boolean,
        required: false,
      },
      orderPickedByDeliveryManDate: {
        type: Date,
        required: false,
      },
      orderDelivered: {
        type: Boolean,
        required: false,
      },
      orderDeliveredDate: {
        type: Date,
        required: false,
      },
    },

    comments: [
      {
        type: String,
        required: false,
      },
    ],
    // Order Type
    hasPreorderItem: {
      type: Boolean,
      required: false,
    },

    orderedItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        price: {
          type: Number,
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
        tax: {
          type: Number,
          required: false,
        },
        image: {
            type: String,
            required: false,
          },
        status: {
          type: Number,
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
        advance: {
          type: Number,
          required: false,
        },
        discountType: {
          type: String,
          required: false,
        },
        discountAmount: {
          type: Number,
          required: false,
        },
        advance: {
          type: Number,
          required: false,
        },
        vendor: {
          type: Schema.Types.ObjectId,
          ref: "Admin",
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
      },
    ],
    vendors: [
      {
        type: String,
        required: false,
      },
    ],
    requestOrder: {
      type: Boolean,
      required: false,
    },
    orderNotes: {
      type: String,
      required: false,
    },
    statusNote: {
      type: String,
      required: false,
    },
    sessionkey: {
      type: String,
      required: false,
    },
    orderPaymentInfo: {
      type: Schema.Types.ObjectId,
      ref: "OrderPaymentInfo",
      required: false,
    },
    productID: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", schema);
