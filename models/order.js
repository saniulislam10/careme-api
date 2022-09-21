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
    orderedItems: [
      subSchema.orderedItems
    ],
    canceledAmount: {
      type: Number,
      required: false,
    },
    refundedAmount: {
      type: Number,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false,
    },

    // user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    name: {
      type: String,
      required: false,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    shippingAddress: {
      type: String,
      required: false,
    },
    shippingPhoneNo:{
      type: String,
      required: false,
    },
    orderStatusTimeline: [subSchema.orderStatus],
    comments: [
      {
        type: String,
        required: false,
      },
    ],
    orderNotes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", schema);
