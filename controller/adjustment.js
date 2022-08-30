const { validationResult } = require("express-validator");
const Model = require("../models/adjustment");
const Product = require("../models/product");
const UniqueId = require("../models/unique-id");

exports.addSingle = async (req, res, next) => {
  try {
    const adjustmentData = req.body;
    // Increment Order Id Unique
    const incAdjustment = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { adjustmentId: 1 } },
      { new: true, upsert: true }
    );
    const adjustmentIdUnique = padLeadingZeros(incAdjustment.adjustmentId);
    const finalData = {
      ...adjustmentData,
      ...{ adjustmentId: adjustmentIdUnique },
    };
    console.log(finalData);
      const adjustment = new Model(finalData);
      await adjustment.save();
      res.status(200).json({
        message: "Data Added Successfully!",
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

exports.getById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const query = { _id: id };
    const data = await Model.findOne(query);

    res.status(200).json({
      data: data,
      message: "Data fetch Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};


exports.deleteById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const query = { _id: id };
    
    await Model.deleteOne(query);
    res.status(200).json({
      message: "Data deleted Successfully!",
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

exports.getAll = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;

    let queryData;
    let dataCount;

    if (filter) {
      queryData = Model.find(filter);
    } else {
      queryData = Model.find();
    }

    if (paginate) {
      queryData
        .skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1))
        .limit(Number(paginate.pageSize));
    }

    const data = await queryData
      .sort({ createdAt: -1 });

    if (filter) {
      dataCount = await Model.countDocuments(filter);
    } else {
      dataCount = await Model.countDocuments();
    }

    res.status(200).json({
      data: data,
      count: dataCount,
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

exports.updateById = async (req, res, next) => {
  const data = req.body;
  try {
    await Model.findOneAndUpdate({ _id: data._id }, { $set: data });

    res.status(200).json({
      message: "Data Update Successfully!",
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
exports.updateRecieved = async (req, res, next) => {
  const data = req.body;
  try {
    let purchaseData = await Model.findOne({ _id: data._id });
    purchaseData.products[data.index].recieved = data.recieved;
    purchaseData.products[data.index].message = data.message;
    await Model.findOneAndUpdate({ _id: data._id }, { $set: purchaseData });
    for(let i=0; i< purchaseData.products.length; i++){
      let id = purchaseData.products[i].productData._id;
      let recieved = purchaseData.products[i].recieved;
      let purchaseCost = purchaseData.products[i].purchasePrice;
      let purchaseTax = purchaseData.products[i].purchaseTax;
      await Product.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            quantity: recieved,
          },
          $set: {
            costPrice: purchaseCost,
            purchaseTax: purchaseTax,
          },
        }
      ).exec();
    }
    res.status(200).json({
      message: "Data Update Successfully!",
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
