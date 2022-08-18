const {validationResult} = require('express-validator');

// Require Post Schema from Model..
const StockControl = require('../models/stock-control');

exports.addNewStockControl = async (req, res, next) => {  

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
        const dataSchema = new StockControl(data);
        await dataSchema.save();

        res.status(200).json({
            message: 'Stock Control Added Successfully!'
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

exports.getStockControl = async (req, res, next) => {

    try {
        
        const data = await StockControl.find();

        res.status(200).json({
            data: data[0],
            message: 'Stock Control Fetched Successfully'
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

exports.updateStockControl = async (req, res, next) => {

    try {
        
        const data = req.body;
        await StockControl.findByIdAndUpdate(data._id, {$set: data}).exec()

        res.status(200).json({
            message: 'Stock Control Updated Successfully'
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