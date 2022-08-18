const { validationResult } = require("express-validator");
const ProductSubCategory = require("../models/subCategory");
const Product = require("../models/product");

exports.addSubCategory = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Input Validation Error! Please complete required information."
    );
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }

  try {
    const data = req.body;
    const dataExists = await ProductSubCategory.findOne({
      slug: data.slug,
    }).lean();

    if (dataExists) {
      const error = new Error(
        "A product sub category with this name/slug already exists"
      );
      error.statusCode = 406;
      next(error);
    } else {
      const productSubCategory = new ProductSubCategory(data);
      const response = await productSubCategory.save();
      res.status(200).json({
        response,
        message: "Sub Category Added Successfully!",
      });
    }
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.insertManySubCategory = async (req, res, next) => {
  try {
    const data = req.body;
    await ProductSubCategory.deleteMany({});
    const result = await ProductSubCategory.insertMany(data);

    res.status(200).json({
      message: `${
        result && result.length ? result.length : 0
      } Category imported Successfully!`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getAllSubCategory = async (req, res, next) => {
  try {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    let query = ProductSubCategory.find().populate("parent").populate({
      path: "parent",
      model: "Category",
      select: "name",
    });

    if (pageSize && currentPage) {
      query.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    const data = await query;
    const count = await ProductSubCategory.countDocuments();

    //for counting products
    for (var i = 0; i < data.length; i++) {
      const categoryId = data[i]._id;
      const productCount = await Product.find({ childCategory: categoryId });
      data[i].count = productCount.length;
    }

    res.status(200).json({
      data: data,
      count: count,
      message: "Sub Category Added Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getSubCategorysByDynamicSort = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = ProductSubCategory.find(filter);
      countDoc = ProductSubCategory.countDocuments(filter);
    } else {
      queryDoc = ProductSubCategory.find();
      countDoc = ProductSubCategory.countDocuments();
    }

    // Sort
    if (sort) {
      queryDoc = queryDoc.sort(sort);
    }

    // Pagination
    if (paginate) {
      queryDoc
        .skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1))
        .limit(Number(paginate.pageSize));
    }

    if (select) {
      queryDoc.select(select);
    }

    const data = await queryDoc.populate("parent").populate({
      path: "parent",
      model: "Category",
      select: "name",
    });
    // .populate('attributes')
    // .populate('brand')
    // .populate('parentCategory')
    // .populate('subCategory')
    // .populate('tags');

    const count = await countDoc;

    // for counting products
    for (var i = 0; i < data.length; i++) {
      const categoryId = data[i]._id;
      const productCount = await Product.find({ childCategory: categoryId });
      data[i].count = productCount.length;
    }

    res.status(200).json({
      data: data,
      count: count,
      message: "Category Fetched Successfully",
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

exports.getSubCategoryBySubCategoryId = async (req, res, next) => {
  try {
    const subCategoryId = req.params.subCategoryId;
    const productSubCategory = await ProductSubCategory.findOne({
      _id: subCategoryId,
    }).populate("attributes");
    res.status(200).json({
      data: productSubCategory,
      message: "Sub Category fetched Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.editSubCategoryData = async (req, res, next) => {
  const updatedData = req.body;

  try {
    await ProductSubCategory.updateOne(
      { _id: updatedData._id },
      { $set: updatedData }
    );

    await Product.updateMany(
      { subCategory: updatedData._id },
      { subCategorySlug: updatedData.subCategorySlug }
    );
    res.status(200).json({
      message: "SubCategory Updated Successfully!",
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

exports.getSubCategoriesBySearch = async (req, res, next) => {
  try {
    const search = req.query.q;
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    const newQuery = search.split(/[ ,]+/);
    const queryArray = newQuery.map((str) => ({
      subCategoryName: RegExp(str, "i"),
    }));
    // const regex = new RegExp(query, 'i')

    let productSubCategories = ProductSubCategory.find({
      $or: [{ $and: queryArray }],
    });

    if (pageSize && currentPage) {
      productSubCategories
        .skip(pageSize * (currentPage - 1))
        .limit(Number(pageSize));
    }

    const results = await productSubCategories;
    const count = results.length;

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

exports.getSubCategoryByCategoryId = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const productSubCategory = await ProductSubCategory.find({
      parent: categoryId,
    });

    res.status(200).json({
      data: productSubCategory,
      message: "Sub category fetched Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getSubCategoryBySubCategorySlug = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Input Validation Error! Please complete required information."
    );
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return;
  }

  const subCategorySlug = req.params.subCategorySlug;
  const productSubCategory = await ProductSubCategory.findOne({
    slug: subCategorySlug,
  });
  // .populate('attributes')

  try {
    res.status(200).json({
      data: productSubCategory,
      // message: 'Brand Added Successfully!'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.deleteSubCategoryBySubCategoryId = async (req, res, next) => {
  const subCategoryId = req.params.subCategoryId;
  // const defaultSubCategory = await ProductSubCategory.findOne({readOnly: true});
  // await Product.updateMany({subCategory: subCategoryId}, {
  //     $set: {
  //         subCategory: defaultSubCategory._id,
  //         subCategorySlug: defaultSubCategory.subCategorySlug
  //     }
  // })
  await ProductSubCategory.deleteOne({ _id: subCategoryId });

  try {
    res.status(200).json({
      message: "Sub Category Deleted Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};
