const { validationResult } = require("express-validator");
const UniqueId = require("../models/unique-id");
const Invoice = require("../models/invoice");
const Product = require("../models/product");
const Order = require("../models/order");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

exports.addInvoice = async (req, res, next) => {


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
    const incInvoice = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { invoiceId: 1 } },
      { new: true, upsert: true }
    );

    const invoiceIdUnique = padLeadingZeros(incInvoice.invoiceId);
    let invoiceData = req.body;
    const finalData = { ...invoiceData, ...{ invoiceId: invoiceIdUnique } };
    const invoice = new Invoice(finalData);
    const invoiceSave = await invoice.save();

    // console.log(orderData);
    // console.log(orderData[0].orderedItems);

    for (let i = 0; i < finalData.products.length; i++) {
      let data = finalData.products[i];
      let status = 3;
      let invQty = data.quantity;
      let totalInvQty = invQty + data.invoicedQuantity;
      let totalOrderQty = data.totalOrderQty;
      if (totalInvQty === totalOrderQty) {
        status = 4;
      }
      await Order.findOneAndUpdate(
        { orderId: finalData.orderNumber },
        {
          $inc: {
            "orderedItems.$[e1].invoicedQuantity": invQty,
          },
          $set: {
            "orderedItems.$[e1].deliveryStatus": status,
          }
        },
        {
          arrayFilters: [
            { "e1.sku": data.sku },
          ],
        }
      );


      let id = invoiceData.products[i].productId;
      let qty = finalData.products[i].quantity;
      let variant = finalData.products[i].variant;
      let sku = finalData.products[i].sku;

      await Product.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            committedQuantity: -qty,
          }
        });

      if (variant) {
        await Product.findOneAndUpdate(
          { _id: id },
          {
            $inc: {
              "variantFormArray.$[e1].variantCommittedQuantity": -qty,
            }
          },
          {
            arrayFilters: [
              { "e1.variantSku": sku },
            ],
          });
      }
    }


    res.json({
      _id: invoiceSave._id,
      invoiceId: invoiceIdUnique,
      success: true,
      message: "Invoice Created successfully",
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

exports.getAllInvoicesByOrderNo = async (req, res, next) => {

  try {

    const orderNo = req.params.id;
    const data = await Invoice.find({ orderNumber: orderNo });

    res.json({
      data: data,
      success: true,
      message: "Invoice fetched successfully",
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

exports.getAllInvoices = async (req, res, next) => {

  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = Invoice.find(filter);
      countDoc = Invoice.countDocuments(filter);
    } else {
      queryDoc = Invoice.find();
      countDoc = Invoice.countDocuments();
    }

    // Sort
    if (sort) {
      queryDoc = queryDoc.sort(sort);
    }
    // Pagination
    if (paginate) {
      queryDoc
        .skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1))
        .limit(Number(paginate.pageSize));
    }

    if (select) {
      queryDoc.select(select);
    }

    const data = await queryDoc;

    const count = await countDoc;
    res.status(200).json({
      data: data,
      count: count
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

exports.getInvoiceById = async (req, res, next) => {

  try {

    const id = req.params.id;
    const data = await Invoice.findOne({ invoiceId: id });

    res.json({
      data: data,
      success: true,
      message: "All Invoice fetched successfully",
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
exports.updateInvoiceById = async (req, res, next) => {

  try {

    const updatedData = req.body;
    await Invoice.updateOne({_id: updatedData._id}, {$set: updatedData})

    res.json({
      message: "Invoice updated successfully",
      success: true,
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

exports.getInvoicesBySearch = async (req, res, next) => {
  try {
    // Query Text
    const search = req.query.q;

    // Additional Filter
    const filter = req.body.filter;
    const sort = req.body.sort;

    // Pagination
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;

    // Build Regex Query
    const newQuery = search.split(/[ ,]+/);
    const queryArray = newQuery.map((str) => ({ invoiceId: RegExp(str, "i") }));
    const queryArray2 = newQuery.map((str) => ({ orderNumber: RegExp(str, "i") }));
    const queryArray3 = newQuery.map((str) => ({ customerName: RegExp(str, 'i') }));
    // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
    // const regex = new RegExp(query, 'i')

    let dataDoc;
    let countDoc;

    if (filter) {
      dataDoc = Invoice.find({
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

      countDoc = Invoice.countDocuments({
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
      dataDoc = Invoice.find({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          { $and: queryArray3 },
          // {$and: queryArray4},
        ],
      });

      countDoc = Invoice.countDocuments({
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


/**
 * ADDITIONAL FUNCTIONS
 */
function padLeadingZeros(num) {
  return 'INV' + String(num).padStart(4, "0");
}
