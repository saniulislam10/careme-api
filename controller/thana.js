// Require Main Modules..
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const Thana = require('../models/thana');

exports.addThana = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const data = req.body;


    const thana = new Thana(data);

    try {
        const response = await thana.save();
        res.status(200).json({
            response,
            message: 'Thana Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getAllThana = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const thana = await Thana.find()
    try {
        res.status(200).json({
            data: thana,
            count: thana.length
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getThanaByThanaId = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const thanaId = req.params.thanaId;
    const thana = await Thana.findOne({_id: thanaId})

    try {
        res.status(200).json({
            data: thana,
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

exports.getAllThanasByCityId = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const cityId = req.params.cityId;
    const thana = await Thana.find({cityname: cityId})

    try {
        res.status(200).json({
            data: thana,
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
exports.getAllThanasByZilaId = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const zilaId = req.params.zilaId;
    const thana = await Thana.find({zilaname: zilaId})
    const count = await Thana.countDocuments({zilaname: zilaId})

    try {
        res.status(200).json({
            data: thana,
            count: count,
            message: 'All thana fecthed successfully',
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
exports.getThanasCount = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const zilaId = req.params.zilaId;
    const count = await Thana.countDocuments({zilaname: zilaId})

    try {
        res.status(200).json({
            data: thana,
            count: count,
            message: 'All thana fecthed successfully',
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

exports.editThanaData = async (req, res, next) => {

    const updatedData = req.body;

    try {
        await Thana.updateOne({_id: updatedData._id}, {$set: updatedData})
        res.status(200).json({
            message: 'Thana Updated Successfully!'
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

exports.deleteThanaByThanaId = async (req, res, next) => {

    const thanaId = req.params.thanaId;
    await Thana.deleteOne({_id: thanaId});

    try {
        res.status(200).json({
            message: 'Thana Deleted Successfully',
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
