const { validationResult } = require("express-validator");
const Product = require("../models/product");
const ArchivedProduct = require("../models/archived");
const Cart = require("../models/cart");
const schedule = require('node-schedule');

exports.addSingleProduct = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data)
    const dataExists = await Product.findOne({ slug: data.slug }).lean();
    const skuExists = await Product.findOne({ sku: data.sku }).lean();

    if (dataExists) {
      const error = new Error("A product with this name/slug already exists");
      error.statusCode = 406;
      next(error);
    } else if (skuExists){
      const error = new Error("A product with this sku already exists");
      // error.message("A product with this sku already exists");
      error.statusCode = 406;
      next(error);
    } else {
      const product = new Product(data);
      const productRes = await product.save();

      res.status(200).json({
        message: "Product Added Successfully!",
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

exports.getSingleProductById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const query = { _id: id };
    const data = await Product.findOne(query)
    .populate('productType')
    .populate("variantFormArray.variantVendorName");

    res.status(200).json({
      data: data,
      message: "Product fetch Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getSingleProductBySlug = async (req, res, next) => {
  const slug = req.params.slug;

  try {
    const query = { slug: slug };
    const data = await Product.findOne(query)
    .populate('productType')
    .populate("vendor")
    .populate('brand')
    .populate("variantFormArray.variantVendorName")

    console.log(data);
    // .populate('attributes')
    // .populate('category')
    // .populate('subCategory');

    res.status(200).json({
      data: data,
      message: "Product fetch Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.deleteProductById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const query = { _id: id };
    const data = await Product.findById(id).select('-_id -createdAt -updatedAt -__v');
    let newData = {
      name: data.name,
      slug: data.slug,
      brand: data.brand,
      medias: data.medias,
      status: data.status,
      description: data.description,
      images: data.images,
      canPartialPayment: data.canPartialPayment,
      canEarnPoints: data.canEarnPoints,
      canRedeemPoints: data.canRedeemPoints,
      sku: data.sku,
      weight: data.weight,
      sku: data.sku,
    }
    const archievedProduct = new ArchivedProduct(newData);
    await archievedProduct.save();

    
    await Cart.deleteMany({product: id});

    await Product.deleteOne(query);
    const date = new Date();
    date.setSeconds(date.getSeconds() + 60);
    const job = schedule.scheduleJob(date, async () => {
      await ArchivedProduct.deleteOne({sku: data.sku});
    });
    console.log("timing");
    res.status(200).json({
      message: "Product deleted Successfully!",
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

exports.getAllProducts = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;

    let queryData;
    let dataCount;

    if (filter) {
      queryData = Product.find(filter);
    } else {
      queryData = Product.find();
    }

    if (paginate) {
      queryData
        .skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1))
        .limit(Number(paginate.pageSize));
    }

    const data = await queryData
    .populate(
      {
        path : "productType"
      }
    )
    .populate("brand")
    .populate("vendor")
    .populate("variantFormArray.variantVendorName")
    .sort({ createdAt: -1 });

    if (filter) {
      dataCount = await Product.countDocuments(filter);
    } else {
      dataCount = await Product.countDocuments();
    }

    res.status(200).json({
      data: data,
      count: dataCount,
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


exports.getAllArchivedProducts = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;

    let queryData;
    let dataCount;

    let priceRange = {
      minPrice: 0,
      maxPrice: 0,
    };
    let minPrice;
    let maxPrice;

    let type = "default";
    let i = -1;

    if (filter) {
      if ("categorySlug" in filter) {
        type = "cat";
        i = index;
      }
      if ("subCategorySlug" in filter) {
        type = "subCat";
        i = index;
      }
      if ("tags" in filter) {
        type = "tag";
        i = index;
      }

      if (type == "cat") {
        minPrice = ArchivedProduct.find(filter[i]).sort({ price: 1 }).limit(1);
        maxPrice = ArchivedProduct.find(filter[i]).sort({ price: -1 }).limit(1);
      } else if (type == "subCat") {
        minPrice = ArchivedProduct.find(filter[i]).sort({ price: 1 }).limit(1);
        maxPrice = ArchivedProduct.find(filter[i]).sort({ price: -1 }).limit(1);
      } else if (type == "tag") {
        minPrice = ArchivedProduct.find(filter[i]).sort({ price: 1 }).limit(1);
        maxPrice = ArchivedProduct.find(filter[i]).sort({ price: -1 }).limit(1);
      } else {
        minPrice = ArchivedProduct.find().sort({ price: 1 }).limit(1);
        maxPrice = ArchivedProduct.find().sort({ price: -1 }).limit(1);
      }
    } else {
      minPrice = ArchivedProduct.find().sort({ price: 1 }).limit(1);
      maxPrice = ArchivedProduct.find().sort({ price: -1 }).limit(1);
    }

    const temp1 = await minPrice;
    const temp2 = await maxPrice;

    priceRange.minPrice = temp1.length > 0 ? temp1[0].price : 0;
    priceRange.maxPrice = temp2.length > 0 ? temp2[0].price : 0;

    if (filter) {
      queryData = ArchivedProduct.find(filter);
    } else {
      queryData = ArchivedProduct.find();
    }

    if (paginate) {
      queryData
        .skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1))
        .limit(Number(paginate.pageSize));
    }

    const data = await queryData
    .populate('productType')
    .populate("vendor")
    .populate('brand')
    .populate("variantFormArray.variantVendorName")
      // .populate('attributes')
      // .populate('category')
      // .populate('subCategory')
      // .populate('tags')
      .sort({ createdAt: -1 });

    if (filter) {
      dataCount = await ArchivedProduct.countDocuments(filter);
    } else {
      dataCount = await ArchivedProduct.countDocuments();
    }

    res.status(200).json({
      data: data,
      priceRange: priceRange,
      count: dataCount,
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


exports.getProductsByDynamicSort = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;


    let queryDoc;

    // Filter
    if (filter) {
      queryDoc = Product.find(filter);
    } else {
      queryDoc = Product.find();
    }

    // Sort
    if (sort) {
      queryDoc = queryDoc.sort(sort);
    }else{
      queryDoc = queryDoc.sort({createdAt : -1});
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

    const data = await queryDoc
    .populate("brand")
    .populate("vendor")
    .populate("variantFormArray.variantVendorName")
    const count = await Product.countDocuments({ hasLink: false });

    res.status(200).json({
      data: data,
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

exports.getAddByLinkProductsByDynamicSort = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = Product.find(filter);
      countDoc = Product.countDocuments(filter);
    } else {
      queryDoc = Product.find();
      countDoc = Product.countDocuments();
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

    const data = await queryDoc
      // .populate('attributes')
      .populate('brand')
      .populate('productType')
    .populate("vendor")
    .populate("variantFormArray.variantVendorName")
      .sort({ createdAt: -1 });
    // .populate('subCategory')
    // .populate('tags');

    const count = await countDoc;

    res.status(200).json({
      data: data,
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

exports.updateProductById = async (req, res, next) => {
  const data = req.body;
  try {
    await Product.findOneAndUpdate({ _id: data._id }, { $set: data });

    res.status(200).json({
      message: "Product Update Successfully!",
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

exports.getProductsBySearch = async (req, res, next) => {
  try {
    // Query Text
    let search = req.query.q;

    // Additional Filter
    const filter = req.body.filter;

    // Pagination
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;

    // Build Regex Query
    const newQuery = search.split(/[ ,]+/);
    const queryArray = newQuery.map((str) => ({ name: RegExp(str, "i") }));
    const queryArray2 = newQuery.map((str) => ({ sku: RegExp(str, "i") }));
    const queryArray3 = newQuery.map((str) => ({link: RegExp(str, 'i')}));
    const queryArray4 = newQuery.map((str) => ({variantFormArray: { $elemMatch: { variantSku: str }}}));
    // const regex = new RegExp(query, 'i')

    let dataDoc;
    let countDoc;

    if (filter) {
      dataDoc = Product.find({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              { $and: queryArray3 },
              { $and: queryArray4 },
            ],
          },
        ],
      });

      countDoc = Product.countDocuments({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              {$and: queryArray3},
              {$and: queryArray4},
            ],
          },
        ],
      });
    } else {
      dataDoc = Product.find({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          {$and: queryArray3},
          // {$and: queryArray4},
        ],
      })

      countDoc = Product.countDocuments({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          {$and: queryArray3},
          {$and: queryArray4},
        ],
      });
    }

    // {marketer: {$in: [null]}}

    if (pageSize && currentPage) {
      dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize));
    }

    const results = await dataDoc
    .populate('productType')
    .populate("brand")
    .populate("vendor")
    .populate("variantFormArray.variantVendorName")
    
    const count = await countDoc;
    
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

exports.getProductsBySearchAdmin = async (req, res, next) => {
  try {
    // Query Text
    const search = req.query.q;

    // Additional Filter
    const filter = req.body.filter;

    // Pagination
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;

    // Build Regex Query
    const newQuery = search.split(/[ ,]+/);
    const queryArray = newQuery.map((str) => ({ name: RegExp(str, "i") }));
    const queryArray2 = newQuery.map((str) => ({ sku: RegExp(str, "i") }));
    // const queryArray3 = newQuery.map((str) => ({phoneNo: RegExp(str, 'i')}));
    // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
    // const regex = new RegExp(query, 'i')

    let dataDoc;
    let countDoc;
    
    if (filter) {
      dataDoc = Product.find({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              // {$and: queryArray3},
              // {$and: queryArray4},
            ],
          },
        ],
      });

      countDoc = Product.countDocuments({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              // {$and: queryArray3},
              // {$and: queryArray4},
            ],
          },
        ],
      });
    } else {
      dataDoc = Product.find({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          // {$and: queryArray3},
          // {$and: queryArray4},
        ],
      });

      countDoc = Product.countDocuments({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          // {$and: queryArray3},
          // {$and: queryArray4},
        ],
      });
    }

    // {marketer: {$in: [null]}}

    if (pageSize && currentPage) {
      
      dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize));
    }

    const results = await dataDoc
    .populate("brand")
    .populate('productType')
    .populate("vendor")
    .populate("variantFormArray.variantVendorName");
    const count = await countDoc;
    
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

exports.updateMultipleProductById = async (req, res, next) => {
  const data = req.body;
  try {
    data.forEach((m) => {
      Product.findByIdAndUpdate(
        m._id,
        { $set: m },
        { new: true, multi: true }
      ).exec();
    });

    res.status(200).json({
      message: "Bulk Product Update Successfully!",
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

exports.updateProductQuantityById = async (req, res, next) => {
  const data = req.body;
  try {
    const tempProduct = await Product.findOne({'_id': data.product._id})

    const variantData = tempProduct.variantFormArray.filter(f=> {
      if(f.variantSku===data.sku){
        return f
      }
    })[0]

    console.log("this is v",variantData)
    console.log("this is v",data.tempQuantity)
    
    if(variantData.variantQuantity<=0 && data.tempQuantity<0 ){
      data.tempQuantity=0
    }

    await Product.findOneAndUpdate(
        { _id: data.product._id },
        {
          $inc: {
            "variantFormArray.$[e1].variantQuantity": parseInt(data.tempQuantity),
            //quantity: data.quantity
          }
        },
        {
          arrayFilters: [
            { "e1.variantSku": data.sku },
          ],
        });
      
    res.status(200).json({
      message: "Product Quantity Updated Successfully!",
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

exports.getSelectedProductDetails = async (req, res, next) => {
  try {
    const selectedIds = req.body.selectedIds;

    const data = await Product.find({ _id: { $in: selectedIds } })
    .populate('productType')
    .populate("brand")
    .populate("vendor")
    .populate("variantFormArray.variantVendorName");

    res.status(200).json({
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
};
