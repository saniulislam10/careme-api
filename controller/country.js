// Require Post Schema from Model..
const Country = require('../models/country');

exports.add = async (req, res, next) => {
    try {

        let data = req.body;
        let country = new Country(data);
        await country.save();

        res.status(200).json({
            message: "Country added successfully",
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

        const data = await Country.find();

        res.status(200).json({
            data: data,
            message: "Countrys fetched successfully",
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
        // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')

        let dataDoc = Country.find({
            $and: [
                {
                    $or: [
                        { $and: queryArray },
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
        const data = Country.findOne({ _id: updatedData._id });
        const finalData = { ...updatedData, ...{ password: data.password } }
        await Country.updateOne({ _id: updatedData._id }, { $set: updatedData })

        res.status(200).json({
            message: "Country edited successfully",
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
        await Country.deleteOne({ _id: id });

        res.status(200).json({
            message: "Country deleted successfully",
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

