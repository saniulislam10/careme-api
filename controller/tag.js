const {validationResult} = require('express-validator');

// Require Post Schema from Model..
const Tag = require('../models/tag');


exports.addTag = async (req, res, next) => {

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
        const dataSchema = new Tag(data);
        await dataSchema.save();

        res.status(200).json({
            message: 'Tag Added Successfully!'
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

exports.getAllTags = async (req, res, next) => {
   
    try {
        let paginate = req.body.paginate;
        let filter = req.body.filter;
        let sort = req.body.sort;
        let select = req.body.select;
        // console.log(req.body);

        let queryDoc;
        let countDoc;


        // Filter
        if (filter) {
            queryDoc = Tag.find(filter);
            countDoc = Tag.countDocuments(filter);
        } else {
            queryDoc = Tag.find();
            countDoc = Tag.countDocuments();
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
        // console.log(data);

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

exports.deleteTag = async (req, res, next) => {
    try {
        const id = req.params.tagId;
        await Tag.deleteOne({_id: id});
       
        res.status(200).json({
            message: 'Tag deleted successfully',
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