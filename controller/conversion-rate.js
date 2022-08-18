const { validationResult } = require("express-validator");
const ConversionRate = require("../models/conversion-rate");

exports.addConversionRate = async (req, res, next) => {

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
    const data = req.body;
    const dataSchema = new ConversionRate(data);
    await dataSchema.save();

    res.status(200).json({
      message: "Conversion Rate Added Successfully!",
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

exports.editConversionRate = (req, res, next) => {
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

  const updatedData = req.body;
  const query = { _id: updatedData._id };
  const push = { $set: updatedData };

  ConversionRate.findOneAndUpdate(query, push)
    .then(() => {
      res.status(200).json({
        message: "Conversion Rate Updated Success!",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getAllConversionRate = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = ConversionRate.find(filter);
      countDoc = ConversionRate.countDocuments(filter);
    } else {
      queryDoc = ConversionRate.find();
      countDoc = ConversionRate.countDocuments();
    }

    // Sort
    if (sort) {
      queryDoc = queryDoc.sort(sort);
    }

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

exports.getSpecificConversionRateBycatId = async (req, res, next) => {
  try {
    const dataUrl = req.body.url;
    const query = { url: dataUrl };
    const data = await ConversionRate.findOne(query);

    res.status(200).json({
      data: data.rate,
    });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getSingleConversionRateById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const query = { _id: id };
    const data = await ConversionRate.findOne(query);
    // .populate('attributes')
    // .populate('brand')
    // .populate('category')
    // .populate('subCategory');

    res.status(200).json({
      data: data,
      message: "Conversion Rate fetch Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};
exports.deleteConversionRate = async (req, res, next) => {
  try {
    const id = req.params.conversionRateId;
    await ConversionRate.deleteOne({ _id: id });

    res.status(200).json({
      message: "Conversion Rate deleted successfully",
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
