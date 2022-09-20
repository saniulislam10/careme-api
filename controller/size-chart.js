const {validationResult} = require('express-validator');
const Product = require('../models/product');

// Require Post Schema from Model..
const SizeChart = require('../models/size-chart');

exports.addNewSizeChart = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }
    try {

        const data = req.body;
        const dataSchema = new SizeChart(data);
        await dataSchema.save();

        res.status(200).json({
            message: 'Size Chart Added Successfully!'
        });
    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editNewSizeChart = async (req, res, next) => {

    const updatedData = req.body;
    console.log("data",updatedData)
    const query = {_id: updatedData._id}
    const push = {$set: updatedData}

    SizeChart.findOneAndUpdate(query, push)
        .then(() => {
            res.status(200).json({
                message: 'Image Updated Success!'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getAllSizeChart = async (req, res, next) => {
   

    try {
        let paginate = req.body.paginate;
        let filter = req.body.filter;
        let sort = req.body.sort;
        let select = req.body.select;

        let queryDoc;
        let countDoc;


        // Filter
        if (filter) {
            queryDoc = SizeChart.find(filter);
            countDoc = SizeChart.countDocuments(filter);
        } else {
            queryDoc = SizeChart.find();
            countDoc = SizeChart.countDocuments();
        }

        // Sort
        if (sort) {
            queryDoc = queryDoc.sort(sort);
        }


        if (paginate) {
            queryDoc.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }


        if (select) {
            queryDoc.select(select)
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
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSizeChartByParentId = async (req, res, next) => {
   

    try {
        const parentId = req.params.id;

        const data = await SizeChart.find();

        res.status(200).json({
            data: data,
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSizeChartByCategoryAndSubCategoryId = async (req, res, next) => {
   

    try {
        const parentId = req.body.parent;
        const childIds = req.body.child;

        let datas = [];
        for(let i=0; i<childIds.length; i++){
            let data = await Product.find();
            for(let x=0; x<data.length; x++){
                datas.push(data[x]);
            }
        }

        res.status(200).json({
            data: datas,
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.deleteSizeChart = async (req, res, next) => {
   

    try {
        const sizeChart = req.params.sizeChartId;
        await SizeChart.deleteOne({_id: sizeChart});
       
        res.status(200).json({
            message: 'Size chart deleted successfully',
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
