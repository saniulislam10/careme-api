// Require Post Schema from Model..
const Admin = require('../models/admin');
const Product = require('../models/product');
const Role = require('../models/role');

exports.getAll = async (req, res, next) => {
    try {

        const data = await Admin.find({ role: 'VENDOR' }).select('-password');

        res.status(200).json({
            data: data,
            message: "Vendors fetched successfully",
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
        const filter = { role: 'VENDOR'};
    
        // Pagination
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
    
        // Build Regex Query
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({ name: RegExp(str, "i") }));
        const queryArray2 = newQuery.map((str) => ({ phoneNo: RegExp(str, "i") }));
        const queryArray3 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')
    
        let dataDoc;
    
        if (filter) {
          dataDoc = Admin.find({
            $and: [
              filter,
              {
                $or: [
                  { $and: queryArray },
                  { $and: queryArray2 },
                  {$and: queryArray3},
                  // {$and: queryArray4},
                ],
              },
            ],
          });
    
        } 
    
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
        const data = Admin.findOne({_id: updatedData._id});
        const finalData = {...updatedData, ...{password: data.password}}
        await Admin.updateOne({_id: updatedData._id}, {$set: updatedData})

        res.status(200).json({
            message: "Vendors edited successfully",
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

