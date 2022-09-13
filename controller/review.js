// Require Post Schema from Model..
const Review = require('../models/review');

exports.add = async (req, res, next) => {
  try {

      let data = req.body;
      console.log(data);
      let review = new Review(data);
      await review.save();

      res.status(200).json({
          message: "Review added successfully",
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

        const data = await Review.find()
        .populate(
            {
                path: "user",
                select: "fullName phoneNo"
            }
        )
        console.log(data);
        res.status(200).json({
            data: data,
            message: "Reviews fetched successfully",
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
exports.getAllByUser = async (req, res, next) => {
    try {

        const id = req.userData.userId;
        const data = await Review.find({ user: id});

        res.status(200).json({
            data: data,
            message: "Reviews fetched successfully",
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
        console.log(search);
    
        // Additional Filter
        // const filter = {};
    
        // Pagination
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
    
        // Build Regex Query
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({ message: RegExp(str, "i") }));
        const queryArray3 = newQuery.map((str) => ({sku: RegExp(str, 'i')}));
        const queryArray4 = newQuery.map((str) => ({orderNo: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')
    
        let dataDoc = Review.find({
            $and: [
              {
                $or: [
                  { $and: queryArray },
                  {$and: queryArray3},
                  {$and: queryArray4},
                ],
              },
            ],
          }).populate("user");
    
        // {marketer: {$in: [null]}}
    
        if (pageSize && currentPage) {
          dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize));
        }
    
        const results = await dataDoc;
        console.log(results);
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
        const data = Review.findOne({_id: updatedData._id});
        const finalData = {...updatedData, ...{password: data.password}}
        await Review.updateOne({_id: updatedData._id}, {$set: updatedData})

        res.status(200).json({
            message: "Review edited successfully",
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

