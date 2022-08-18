const { validationResult } = require("express-validator");
const UniqueId = require("../models/unique-id");
const Invoice = require("../models/invoice");

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
    const finalData = { ...req.body, ...{ invoiceId: invoiceIdUnique } };
    const invoice = new Invoice(finalData);
    const invoiceSave = await invoice.save();

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
    
    const orderNo = req.body.data;
    const data = await Invoice.find({orderNumber: orderNo});

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

    const data = await queryDoc
    // .populate({
    //   path: "user",
    //   select: "fullName tag",
    //   populate: {
    //     path: "tag",
    //     select: "name images",
    //   },
    // });

    const count = await countDoc;

    res.status(200).json({
      data: data,
      count: count,Invoice});
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
      const data = await Invoice.findOne({_id: id});
  
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


/**
 * ADDITIONAL FUNCTIONS
 */
function padLeadingZeros(num) {
  return String(num).padStart(4, "0");
}
