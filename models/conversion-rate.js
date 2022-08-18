/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    websiteName: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      require: true,
    },
    rate: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("ConverionRate", schema);
