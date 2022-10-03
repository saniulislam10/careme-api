const { validationResult } = require("express-validator");

const UniqueId = require("../models/unique-id");

// Require Post Schema from Model..

const Return = require("../models/return");
const User = require("../models/user");
const Order = require("../models/order");

exports.addReturn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Input Validation Error! Please complete required information."
    );
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }

  try {
    // Increment Order Id Unique
    const incReturn = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { returnId: 1 } },
      { new: true, upsert: true }
    );

    const data = req.body;
    const returnIdUnique = padLeadingZeros(incReturn.returnId);
    const finalData = { ...data, ...{ returnId: returnIdUnique } };
    const returnObj = new Return(finalData);
    const returnSave = await returnObj.save();

    let returnQuantity = 0;
    for (let i = 0; i < data.products.length; i++) {
      let myString = data.products[i].quantity
      let myNum = parseInt(myString);
      returnQuantity += myNum;
    }

    if (data.user) {
      await User.findOneAndUpdate(
        { _id: data.billingAddress.user },
        { $inc: { totalReturnAmount: data.total, totalReturn: returnQuantity } },
      );
    }
    // totalReturnAmount

    for(let i=0; i<finalData.products.length; i++){
      await Order.findOneAndUpdate(
        { orderId: finalData.orderNumber },
        {
          $inc : {
            "orderedItems.$[e1].returnedQuantity": finalData.products[i].quantity,
          }
        },
        {
          arrayFilters: [
            { "e1.sku": finalData.products[i].sku },
          ],
        }
      );
    }

    res.status(200).json({
      _id: returnSave._id,
      returnId: returnIdUnique,
      success: true,
      message: "Return Created successfully",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getAllReturnsByOrderNo = async (req, res, next) => {

  try {

    const orderNo = req.body.data;

    const data = await Return.find({ orderNumber: orderNo });

    res.json({
      data: data,
      success: true,
      message: "Return fetched successfully",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getAllReturns = async (req, res, next) => {

  try {

    const data = await Return.find().sort({createdAt : -1});

    res.json({
      data: data,
      success: true,
      message: "All Return fetched successfully",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getReturnById = async (req, res, next) => {

  try {

    const id = req.params.id;
    const data = await Return.findOne({ _id: id });

    res.json({
      data: data,
      success: true,
      message: "Return fetched successfully",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;   
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};


/**
 * ADDITIONAL FUNCTIONS
 */
function padLeadingZeros(num) {
  return 'RTO'+String(num).padStart(4, "0");
}
