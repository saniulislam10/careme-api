const { validationResult } = require("express-validator");
const Model = require("../models/purchase");
const Product = require("../models/product");
const UniqueId = require("../models/unique-id");

exports.addSingle = async (req, res, next) => {
  try {
    const purchaseData = req.body;
    // Increment Order Id Unique
    const incPurchase = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { purchaseId: 1 } },
      { new: true, upsert: true }
    );
    const purchaseIdUnique = padLeadingZeros(incPurchase.purchaseId);
    const finalData = {
      ...purchaseData,
      ...{ purchaseId: purchaseIdUnique },
    };
    const purchase = new Model(finalData);
    await purchase.save();
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
    const data = await Model.findOne(query).populate('supplier');

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
      queryData = Model.find(filter).populate('supplier');
    } else {
      queryData = Model.find().populate('supplier');
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
  console.log(data);
  try {
    let purchaseData = await Model.findOne({ _id: data._id });
    purchaseData.products[data.index].recieved += data.recieved;
    purchaseData.products[data.index].message = data.message;

    console.log(purchaseData.products[data.index].sku);
    await Model.findOneAndUpdate({ _id: data._id }, { $set: purchaseData });
    let id = data.productId;
    let recieved = data.recieved;
    let sku = purchaseData.products[data.index].sku;

    await Product.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          quantity: recieved,
        }
      }
    ).exec();

    if (purchaseData.products[data.index].productData.hasVariant) {
      await Product.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            "variantFormArray.$[e1].variantQuantity": recieved,
          },
        },
        {
          arrayFilters: [
            {
              "e1.variantSku": sku,
            },
          ],
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
  return 'PO'+String(num).padStart(4, "0");
}
