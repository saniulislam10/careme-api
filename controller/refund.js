// Require Post Schema from Model..
const Refund = require('../models/refund');
const UniqueId = require("../models/unique-id");

exports.add = async (req, res, next) => {
    try {

        const incRefund = await UniqueId.findOneAndUpdate(
            {},
            { $inc: { refundId: 1 } },
            { new: true, upsert: true }
        );

        const refundIdUnique = padLeadingZeros(incRefund.refundId);

        let data = req.body;
        const finalData = { ...data, ...{ refundId: refundIdUnique } };
        const refundObj = new Refund(finalData);
        const refundSave = await refundObj.save();

        res.status(200).json({
            refundId: refundIdUnique,
            message: "Refund added successfully",
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

        const data = await Refund.find().sort({createdAt : -1});

        res.status(200).json({
            data: data,
            message: "Refunds fetched successfully",
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
      // Additional Filter
      const filter = req.body.filter;
      const sort = req.body.sort;
  
      // Pagination
      const pageSize = +req.query.pageSize;
      const currentPage = +req.query.currentPage;
  
      // Build Regex Query
      const newQuery = search.split(/[ ,]+/);
      const queryArray = newQuery.map((str) => ({ refundId: RegExp(str, "i") }));
      const queryArray2 = newQuery.map((str) => ({ returnId: RegExp(str, "i") }));
      const queryArray3 = newQuery.map((str) => ({ orderNumber: RegExp(str, 'i') }));
      // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
      // const regex = new RegExp(query, 'i')
  
      let dataDoc;
      let countDoc;
  
      if (filter) {
        dataDoc = Refund.find({
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
  
        countDoc = Refund.countDocuments({
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
        dataDoc = Refund.find({
          $or: [
            { $and: queryArray },
            { $and: queryArray2 },
            { $and: queryArray3 },
            // {$and: queryArray4},
          ],
        });
  
        countDoc = Refund.countDocuments({
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

exports.getFilteredData = async (req, res, next) => {
    try {

        // Query Text
        const search = req.query.q;

        // Additional Filter
        // const filter = {};

        // Pagination
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;

        // Build Regex Query
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({ name: RegExp(str, "i") }));
        const queryArray3 = newQuery.map((str) => ({ link: RegExp(str, 'i') }));
        // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')

        let dataDoc = Refund.find({
            $and: [
                {
                    $or: [
                        { $and: queryArray },
                        { $and: queryArray3 }
                        // {$and: queryArray4},
                    ],
                },
            ],
        });

        // {marketer: {$in: [null]}}

        if (pageSize && currentPage) {
            dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize));
        }

        const results = await dataDoc;
        res.status(200).json({
            data: results
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

exports.editById = async (req, res, next) => {
    try {

        let updatedData = req.body;
        const data = Refund.findOne({ _id: updatedData._id });
        await Refund.updateOne({ _id: updatedData._id }, { $set: updatedData })

        res.status(200).json({
            message: "Refund edited successfully",
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

exports.getByReturnId = async (req, res, next) => {
    try {

        let returnId = req.params.id;
        // const data = Refund.findOne({ returnId: returnId });

        res.status(200).json({
            data: data,
            message: "Refund fetched successfully"
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
exports.deleteById = async (req, res, next) => {
    try {

        let id = req.params.id;
        await Refund.deleteOne({ _id: id });

        res.status(200).json({
            message: "Refund deleted successfully",
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

function padLeadingZeros(num) {
    return 'RFD' + String(num).padStart(4, "0");
}

