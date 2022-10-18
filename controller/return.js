const { validationResult } = require("express-validator");

const UniqueId = require("../models/unique-id");

// Require Post Schema from Model..

const Return = require("../models/return");
const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const Invoice = require("../models/invoice");

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

    for (let i = 0; i < finalData.products.length; i++) {
      await Order.findOneAndUpdate(
        { orderId: finalData.orderNumber },
        {
          $inc: {
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
    for (let i = 0; i < finalData.products.length; i++) {
      await Invoice.findOneAndUpdate(
        { invoiceId: finalData.invoiceId },
        {
          $inc: {
            "products.$[e1].returnedQuantity": finalData.products[i].quantity,
          },
          $set: {
            "deliveryStatus": 6,
            "products.$[e1].deliveryStatus": 6,
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

    const orderNo = req.params.id;

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
exports.getAllReturnsByInvoiceId = async (req, res, next) => {

  try {

    const invoiceId = req.params.id;

    const data = await Return.find({ invoiceId: invoiceId });

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

    let sort = req.body.sort;
    let paginate = req.body.paginate;

    let dataDoc;
    dataDoc = Return.find();
    if(sort){
      dataDoc = dataDoc.sort(sort);
    }else{
      dataDoc = dataDoc.sort({ createdAt: -1 })
    }

    if (paginate) {
      dataDoc
        .skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1))
        .limit(Number(paginate.pageSize));
    }

    let data = await dataDoc;

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

exports.getBySearch = async (req, res, next) => {
  try {
    // Query Text
    const search = req.query.q;

    console.log(search);
    // Additional Filter
    const filter = req.body.filter;
    const sort = req.body.sort;

    // Pagination
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;

    // Build Regex Query
    const newQuery = search.split(/[ ,]+/);
    const queryArray = newQuery.map((str) => ({ returnId: RegExp(str, "i") }));
    const queryArray2 = newQuery.map((str) => ({ orderNumber: RegExp(str, "i") }));
    const queryArray3 = newQuery.map((str) => ({ invoiceId: RegExp(str, 'i') }));
    // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
    // const regex = new RegExp(query, 'i')

    let dataDoc;
    let countDoc;

    if (filter) {
      dataDoc = Return.find({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              { $and: queryArray3 },
              // {$and: queryArray4},
            ],
          },
        ],
      });

      countDoc = Return.countDocuments({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              { $and: queryArray3 },
              // {$and: queryArray4},
            ],
          },
        ],
      });
    } else {
      dataDoc = Return.find({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          { $and: queryArray3 },
          // {$and: queryArray4},
        ],
      });

      countDoc = Return.countDocuments({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          { $and: queryArray3 },
          // {$and: queryArray4},
        ],
      });
    }

    if (sort) {
      dataDoc = dataDoc.sort(sort);
    }


    if (pageSize && currentPage) {
      dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize));
    }

    const results = await dataDoc;
    const count = await countDoc;

    console.log(results);

    res.status(200).json({
      data: results,
      count: count,
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
    const data = await Return.findOne({ returnId: id });

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

exports.updateReturnById = async (req, res, next) => {

  try {

    const id = req.params.id;
    const data = req.body;
    await Return.findOneAndUpdate({ _id: id }, { $set: data });

    res.json({
      success: true,
      message: "Return Updated successfully",
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
exports.recieveReturnById = async (req, res, next) => {

  try {

    const id = req.params.id;
    const data = req.body;
    const invoiceId = data.invoiceId;

    console.log("Invoice", invoiceId);

    await Invoice.findOneAndUpdate({ invoiceId: invoiceId}, {
      $set : {
        deliveryStatus: data.deliveryStatus
      }
    })

    await Return.findOneAndUpdate({ _id: id }, { $set: data });

    data.products.forEach(m => { incQtySku(m.sku, m.recievedQty) });

    // if (data.recievedQuantity) {
    //   console.log(data.recievedQuantity);
    // }

    res.json({
      success: true,
      message: "Return Updated successfully",
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
  return 'RTO' + String(num).padStart(4, "0");
}

async function incQtySku(sku, qty) {
  let mainSku;
  if (sku) {
    mainSku = sku.split('-')[0];
  }
  console.log(mainSku);
  await Product.findOneAndUpdate(
    { sku: mainSku },
    {
      $inc: {
        "variantFormArray.$[e1].variantQuantity": qty,
      }
    },
    {
      arrayFilters: [{ "e1.variantSku": sku }],
    }
  ).exec();
}
