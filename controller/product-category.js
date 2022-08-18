const {validationResult} = require('express-validator');
const ProductCategory = require('../models/category');
const Product = require('../models/product');
const ProductSubCategory = require('../models/subCategory');


exports.addCategory = async (req, res, next) => {
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
        const dataExists = await ProductCategory.findOne({name: data.name}).lean();
        if (dataExists) {
            const error = new Error('A product category with this name/slug already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const productCategory = new ProductCategory(data);
            const response = await productCategory.save();
            res.status(200).json({
                response,
                message: 'Category Added Successfully!'
            });
        }

    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.insertManyCategory = async (req, res, next) => {

    try {
        const data = req.body;
        await ProductCategory.deleteMany({});
        const result = await ProductCategory.insertMany(data);

        res.status(200).json({
            message: `${result && result.length ? result.length : 0} Category imported Successfully!`
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getAllCategory = async (req, res, next) => {

    try {
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.page;
        let select = req.query.select;

        let query = ProductCategory.find();

        if(select) {
            query = query.select(select)
        } else {
            // query.populate('attributes')
            query.populate()
        }
        
        if (pageSize && currentPage) {
            query.skip(pageSize * (currentPage - 1)).limit(pageSize)
        }
        
        const data = await query;
        const count = await ProductCategory.countDocuments();


        // for counting products
        for(var i=0; i<data.length; i++){
            const categoryId = data[i]._id;
            const productCount = await Product.find({parentCategory : categoryId })
            data[i].count = productCount.length;
        }

        res.status(200).json({
            data: data,
            count: count
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getCategorysByDynamicSort = async (req, res, next) => {
    try {
        let paginate = req.body.paginate;
        let filter = req.body.filter;
        let sort = req.body.sort;
        let select = req.body.select;

        let queryDoc;
        let countDoc;


        // Filter
        if (filter) {
            queryDoc = ProductCategory.find(filter);
            countDoc = ProductCategory.countDocuments(filter);
        } else {
            queryDoc = ProductCategory.find();
            countDoc = ProductCategory.countDocuments();
        }


        // Sort
        if (sort) {
            queryDoc = queryDoc.sort(sort);
        }

        // Pagination
        if (paginate) {
            queryDoc.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        if (select) {
            queryDoc.select(select)
        }

        const data = await queryDoc
            // .populate('attributes')
            // .populate('brand')
            // .populate('parentCategory')
            // .populate('subCategory')
            // .populate('tags');

        const count = await countDoc;

        // for counting products
        for(var i=0; i<data.length; i++){
            const categoryId = data[i]._id;
            const productCount = await Product.find({parentCategory : categoryId })
            data[i].count = productCount.length;
        }

        res.status(200).json({
            data: data,
            count: count,
            message: "Category Fetched Successfully"
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

exports.getCategoryByCategoryId = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const categoryId = req.params.categoryId;
    const productCategory = await ProductCategory.findOne({_id: categoryId});

    try {
        res.status(200).json({
            data: productCategory,
            // message: 'Brand Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editCategoryData = async (req, res, next) => {

    const updatedData = req.body;

    try {
        await ProductCategory.updateOne({_id: updatedData._id}, {$set: updatedData});

        await Product.updateMany({parentCategory: updatedData._id});


        res.status(200).json({
            message: 'Category Updated Successfully!'
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


exports.getCategoriesBySearch = async (req, res, next) => {
    try {

        const search = req.query.q;
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({name: RegExp(str, 'i')}));
        // const queryArray2 = newQuery.map((str) => ({email: RegExp(str, 'i')}));
        // const queryArray3 = newQuery.map((str) => ({phoneNo: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')
        const filter = req.body.filter;

        let categories;
        console.log(req.query.q)
        if (filter) {
            categories = ProductCategory.find({
                $and: [
                    filter,
                    {
                        $or: [
                            {$and: queryArray}
                        ]
                    }
                ]
            });
        } else {
            categories = ProductCategory.find({
                $or: [
                    {$and: queryArray}
                ]
            });
        }
        console.log(categories)
        // {marketer: {$in: [null]}}

        const results = await categories;

        res.status(200).json({
            data: results,
            count: 0
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
};

exports.getCategoryByCategorySlug = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const categorySlug = req.params.categorySlug;
    const productCategory = await ProductCategory
        .findOne({slug: categorySlug})


    try {
        res.status(200).json({
            data: productCategory,
            // message: 'Brand Added Successfully!'
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

// exports.deleteCategoryByCategoryId = async (req, res, next) => {
//
//     const categoryId = req.params.categoryId;
//     await ProductCategory.deleteOne({_id: categoryId});
//
//     try {
//         res.status(200).json({
//             message: 'Category Deleted Successfully',
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

exports.deleteCategoryByCategoryId = async (req, res, next) => {

    const categoryId = req.params.categoryId;
    const defaultCategory = await ProductCategory.findOne();
    const defaultSubCategory = await ProductSubCategory.findOne();
    console.log("defaultCategory", defaultCategory);
    console.log("defaultSubCategory", defaultSubCategory);
    // await Product.updateMany({parentCategory: categoryId}, { $set : { parentCategory: defaultCategory._id, childCategory: defaultSubCategory._id } })
    await ProductSubCategory.deleteMany({parent: categoryId});
    await ProductCategory.deleteOne({_id: categoryId});

    try {
        res.status(200).json({
            message: 'Category Deleted Successfully',
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
