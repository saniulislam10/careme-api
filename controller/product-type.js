// Require Post Schema from Model..
const ProductType = require('../models/product-type');

exports.add = async (req, res, next) => {
  try {

      let data = req.body;
      let brand = new ProductType(data);
      await brand.save();

      res.status(200).json({
          message: "Product Type added successfully",
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

        const data = await ProductType.find();

        res.status(200).json({
            data: data,
            message: "ProductTypes fetched successfully",
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
        // const queryArray3 = newQuery.map((str) => ({link: RegExp(str, 'i')}));
        // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')
    
        let dataDoc = ProductType.find({
            $and: [
              {
                $or: [
                  { $and: queryArray },
                //   {$and: queryArray3}
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
        const data = ProductType.findOne({_id: updatedData._id});
        const finalData = {...updatedData, ...{password: data.password}}
        await ProductType.updateOne({_id: updatedData._id}, {$set: updatedData})

        res.status(200).json({
            message: "Product Type edited successfully",
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
      await ProductType.deleteOne({_id: id});

      res.status(200).json({
          message: "Product Type deleted successfully",
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

