const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require('./sub-schema-model');

const schema = new Schema(
  {
    invoiceId: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    invoiceDate: {
      type: Date,
      required: false,
    },
    salesPerson: {
      type: String,
      required: false,
    },
    customerName: {
      type: String,
      required: false,
    },
    billingAddress: {
      type: String,
      required: false,
    },
    shippingAddress: {
      type: String,
      required: false,
    },
    subTotal: {
      type: Number,
      required: false,
    },
    adjustment: {
      type: Number,
      required: false,
    },
    deliveryFee: {
      type: Number,
      required: false,
    },
    total: {
      type: Number,
      required: false,
    },
    paidAmount: {
      type: Number,
      required: false,
    },
    deliveryStatus: {
      type: Number,
      required: false,
    },
    paymentStatus: {
      type: Number,
      required: false,
    },

    shippingCarrier: {
      type: String,
      required: false,
    },
    products: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Invoice', schema);
