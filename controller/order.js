const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const enumObj = require("../helpers/enum-obj");
const ax = require("axios");

// Require Post Schema from Model..

const Order = require("../models/order");
const OrderTemp = require("../models/order-temporary");
const requestOrder = require("../models/requestOrder");
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const UniqueId = require("../models/unique-id");

exports.editOrder = async (req, res, next) => {
  const updatedData = req.body;

  try {
    await Order.updateOne({ _id: updatedData._id }, { $set: updatedData });
    res.status(200).json({
      message: "Order Updated Successfully!",
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

// exports.placeOrder = async (req, res, next) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     const error = new Error(
//       "Input Validation Error! Please complete required information."
//     );
//     error.statusCode = 422;
//     error.data = errors.array();
//     next(error);
//     return;
//   } 

//   try {
//     const userId = req.userData.userId;
//     const orderData = req.body;
//     console.log(orderData);

//     // Update Product Data

//     for (let i = 0; i < orderData.orderedItems.length; i++) {
//       const orderitem = orderData.orderedItems[i];
//       const orderedProductWithVarients = await Product.findOne({
//         _id: orderitem.productId,
//       });
//       await Product.findOneAndUpdate(
//         { _id: orderitem.product },
//         {
//           $inc: {
//             committedQuantity: orderitem.quantity,
//           }
//         }
//       ).exec();

//       console.log(orderedProductWithVarients);


//       if (orderedProductWithVarients.hasVariant === true) {
//         await Product.findOneAndUpdate(
//           { _id: orderitem.productId },
//           {
//             $inc: {
//               "variantFormArray.$[e1].variantCommittedQuantity": orderitem.quantity,
//             },
//           },
//           {
//             arrayFilters: [{ "e1.variantSku": orderitem.sku }],
//           }
//         ).exec();

//         varforQty = orderedProductWithVarients.variantFormArray.filter(
//           function (el) {
//             return el.variantSku === orderitem.sku;
//           }
//         );

//         let qty = varforQty[0].variantQuantity - orderitem.quantity;
//         let reOrderQty = varforQty[0].variantReOrder;
//         if (qty <= reOrderQty && qty > 0) {
//           await Product.findOneAndUpdate(
//             { _id: orderitem.productId },
//             { isReOrder: true }
//           );
//         }
//         if (qty <= 0) {
//           await Product.findOneAndUpdate(
//             { _id: orderitem.productId },
//             { isStockOut: true }
//           );
//           await Product.findOneAndUpdate(
//             { _id: orderitem.productId },
//             {
//               $set: {
//                 "variantFormArray.$[e1].variantQuantity": 0,
//               },
//             },
//             {
//               arrayFilters: [{ "e1.variantSku": orderitem.sku }],
//             }
//           ).exec();
//         } else {
//           await Product.findOneAndUpdate(
//             { _id: orderitem.productId },
//             {
//               $inc: {
//                 "variantFormArray.$[e1].variantQuantity": -orderitem.quantity,
//               },
//             },
//             {
//               arrayFilters: [{ "e1.variantSku": orderitem.sku }],
//             }
//           ).exec();
//         }
//       } else {

//         let qty = orderedProductWithVarients.quantity - orderitem.quantity;
//         let reOrderQty = orderedProductWithVarients.reOrder - orderitem.quantity;
//         if (qty <= reOrderQty && qty > 0) {
//           await Product.findOneAndUpdate(
//             { _id: orderitem.product },
//             { isReOrder: true },
//           );
//         }
//         if (qty <= 0) {
//           await Product.findOneAndUpdate(
//             { _id: orderitem.product },
//             { isStockOut: true },
//           );
//         }
//       }
//     }

//     // Increment Order Id Unique
//     const incOrder = await UniqueId.findOneAndUpdate(
//       {},
//       { $inc: { orderId: 1 } },
//       { new: true, upsert: true }
//     );
//     const orderIdUnique = padLeadingZeros(incOrder.orderId);
//     const finalData = {
//       ...req.body,
//       ...{ user: userId, orderId: orderIdUnique },
//     };
//     const order = new Order(finalData);
//     const orderSave = await order.save();

//     if (req.body.couponId) {
//       await Coupon.findByIdAndUpdate(
//         { _id: req.body.couponId },
//         { $push: { couponUsedByUser: userId } }
//       );
//     }
//     // UPDATE USER CARTS & CHECKOUT
//     if (orderData.redeemAmount > 0) {
//       await User.findOneAndUpdate(
//         { _id: userId },
//         {
//           $set: { carts: [] },
//           $push: { checkouts: orderSave._id, usedCoupons: req.body.couponId },
//           $inc: {
//             redeemedPoints: orderData.redeemAmount,
//             points: -orderData.redeemAmount,
//           },
//         }
//       );
//     } else if (orderData.earnAmount > 0) {
//       await User.findOneAndUpdate(
//         { _id: userId },
//         {
//           $set: { carts: [] },
//           $push: { checkouts: orderSave._id, usedCoupons: req.body.couponId },
//           $inc: {
//             points: orderData.earnAmount,
//             earnedPoints: orderData.earnAmount,
//           },
//         }
//       );
//     } else {
//       await User.findOneAndUpdate(
//         { _id: userId },
//         {
//           $set: { carts: [] },
//           $push: { checkouts: orderSave._id, usedCoupons: req.body.couponId },
//         }
//       );
//     }

//     await Cart.deleteMany({ user: new ObjectId(userId) });

//     // Update Quantity
//     const orderDB = await Order.findOne({ _id: orderSave._id }).populate({
//       path: "orderedItems.productId",
//       model: "Product",
//       select: "soldQuantity quantity",
//     });

//     if (orderDB && orderDB.orderedItems.length) {
//       const mOrderProducts = orderDB.orderedItems.map((m) => {
//         return {
//           _id: m.productId,
//           soldQuantity: m.quantity,
//           productSoldQty: m.product.soldQuantity,
//           productQty: m.product.quantity,
//         };
//       });
//       mOrderProducts.forEach(async (m) => {
//         // Create Complex Query
//         const q1 = incrementSoldQuantityQuery(m);
//         const q2 = decrementQuantityQuery(m);
//         let finalQuery;
//         if (q1.$inc && q2.$inc) {
//           finalQuery = {
//             $inc: {
//               soldQuantity: q1.$inc.soldQuantity,
//               quantity: q2.$inc.quantity,
//             },
//           };
//         } else {
//           finalQuery = { ...q1, ...q2 };
//         }

//         const productData = await Product.findOne({ _id: m._id });

//         if (productData.isPreOrder !== true) {
//           Product.updateOne({ _id: m._id }, finalQuery, {
//             new: true,
//             upsert: true,
//             multi: true,
//           }).exec();
//         } else {
//           newqty = q2.$inc ? -q2.$inc.quantity : 0;
//           qty = productData.quantity - newqty;
//           if (qty < 0) {
//             await Product.updateOne(
//               { _id: m._id },
//               {
//                 $set: {
//                   quantity: 0,
//                 },
//               }
//             ).exec();
//           } else {
//             await Product.updateOne(
//               { _id: m._id },
//               {
//                 $inc: {
//                   quantity: -newqty,
//                 },
//               }
//             ).exec();
//           }
//         }
//       });
//     }

//     res.json({
//       _id: orderSave._id,
//       orderId: orderIdUnique,
//       success: true,
//       message: "Order Placed successfully",
//     });
//   } catch (err) {
//     console.log(err);
//     if (!err.statusCode) {
//       err.statusCode = 500;
//       err.message = "Something went wrong on database operation!";
//     }
//     next(err);
//   }
// };

exports.placeOrder = async (req, res, next) => {
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
    const userId = req.userData.userId;
    const orderData = req.body;

    // Update Product Data

    for (let i = 0; i < orderData.orderedItems.length; i++) {
      const orderitem = orderData.orderedItems[i];
      const orderedProductWithVarients = await Product.findOne({
        _id: orderitem.productId,
      });

      let orderedQty = orderitem.quantity;
      let currentQty = orderedProductWithVarients.quantity;
      let newQty = currentQty - orderedQty;
      // if (newQty <= 0) {
      //   newQty = 0;
      // }
      await Product.findOneAndUpdate(
        { _id: orderitem.productId },
        {
          $inc: {
            committedQuantity: orderitem.quantity,
          },
          $set: {
            quantity: newQty,
          }
        },
      ).exec();


      if (orderedProductWithVarients.hasVariant === true) {
        varforQty = orderedProductWithVarients.variantFormArray.filter(
          function (el) {
            return el.variantSku === orderitem.sku;
          }
        );

        let qty = varforQty[0].variantQuantity - orderedQty;
        // if(qty <= 0){
        //   qty = 0;
        // }
        await Product.findOneAndUpdate(
          { _id: orderitem.productId },
          {
            $inc: {
              "variantFormArray.$[e1].variantCommittedQuantity": orderitem.quantity,
            },
            $set: {
              "variantFormArray.$[e1].variantQuantity": qty,
            }
          },
          {
            arrayFilters: [{ "e1.variantSku": orderitem.sku }],
          }
        ).exec();
      }
    }

    // Increment Order Id Unique
    const incOrder = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { orderId: 1 } },
      { new: true, upsert: true }
    );
    const orderIdUnique = padLeadingZeros(incOrder.orderId);
    const finalData = {
      ...req.body,
      ...{ user: userId, orderId: orderIdUnique },
    };
    const order = new Order(finalData);
    const orderSave = await order.save();

    // UPDATE USER CARTS & CHECKOUT
    if (orderData.redeemAmount > 0) {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: { carts: [] },
          $push: { checkouts: orderSave._id },
          $inc: {
            redeemedPoints: orderData.redeemedPoints,
            points: -orderData.redeemedPoints,
          },
        }
      );
    } else if (orderData.earnedPoints > 0) {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: { carts: [] },
          $push: { checkouts: orderSave._id },
          $inc: {
            points: orderData.earnedPoints,
            earnedPoints: orderData.earnedPoints,
          },
        }
      );
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: { carts: [] },
          $push: { checkouts: orderSave._id },
        }
      );
    }
    await Cart.deleteMany({ user: new ObjectId(userId) });

    res.json({
      _id: orderSave._id,
      orderId: orderIdUnique,
      success: true,
      message: "Order Placed successfully",
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

exports.updateOrder = async (req, res, next) => {
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
    const userId = req.userData.userId;
    const orderData = req.body;

    await Order.findOneAndUpdate(
      { orderId: orderData.orderId },
      { $set: req.body }
    );

    res.json({
      _id: orderData.orderId,
      success: true,
      message: "Order Updated successfully",
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
exports.payPayment = async (req, res, next) => {
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
    const orderData = req.body;
    console.log(orderData);

    orderId = orderData.orderId;
    paidAmount = orderData.paidAmount;
    paymentStatus =  orderData.paymentStatus;
    selectedSkus = orderData.selectedSkus;

    await Order.findOneAndUpdate(
      { orderId: orderId },
      {$inc: { paidAmount: paidAmount }},

    )
    for(let i=0; i < selectedSkus.length; i++ ){
      await Order.findOneAndUpdate(
        { orderId: orderId },
        { 
          $set: { 
            "orderedItems.$[e1].paymentStatus": paymentStatus,
          },
        },{
          arrayFilters: [
            { "e1.sku": selectedSkus[i] },
          ],
        }
      );
    }
    

    res.json({
      success: true,
      message: "Payment paid successfully",
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


exports.placeTempOrder = async (req, res, next) => {
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
    const userId = req.userData.userId;
    const orderData = req.body;

    // Increment Order Id Unique
    const incOrder = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { orderTempId: 1 } },
      { new: true, upsert: true }
    );
    const orderIdUnique = padLeadingZeros(incOrder.orderTempId);
    const finalData = {
      ...orderData,
      ...{ user: userId, orderId: orderIdUnique },
    };
    const order = new OrderTemp(finalData);
    const orderSave = await order.save();

    if (req.body.couponId) {
      await Coupon.findByIdAndUpdate(
        { _id: req.body.couponId },
        { $push: { couponUsedByUser: userId } }
      );
    }

    // UPDATE USER CARTS & CHECKOUT
    // await User.findOneAndUpdate(
    //   { _id: userId },
    //   {
    //     $set: { carts: [] },
    //     $push: { checkouts: orderSave._id, usedCoupons: req.body.couponId },
    //   }
    // );

    // await Cart.deleteMany({ user: new ObjectId(userId) });

    // Update Quantity
    const orderDB = await OrderTemp.findOne({ _id: orderSave._id }).populate({
      path: "orderedItems.productId",
      model: "Product",
      select: "soldQuantity quantity",
    });

    if (orderDB && orderDB.orderedItems.length) {
      const mOrderProducts = orderDB.orderedItems.map((m) => {
        return {
          _id: m.product._id,
          soldQuantity: m.quantity,
          productSoldQty: m.product.soldQuantity,
          productQty: m.product.quantity,
        };
      });
      mOrderProducts.forEach(async (m) => {
        // Create Complex Query
        const q1 = incrementSoldQuantityQuery(m);
        const q2 = decrementQuantityQuery(m);
        let finalQuery;
        if (q1.$inc && q2.$inc) {
          finalQuery = {
            $inc: {
              soldQuantity: q1.$inc.soldQuantity,
              quantity: q2.$inc.quantity,
            },
          };
        } else {
          finalQuery = { ...q1, ...q2 };
        }

        const productData = await Product.findOne({ _id: m._id });

        if (productData.continueSelling === false) {
          Product.updateOne({ _id: m._id }, finalQuery, {
            new: true,
            upsert: true,
            multi: true,
          }).exec();
        }
      });
    }

    res.json({
      _id: orderSave._id,
      orderId: orderIdUnique,
      success: true,
      message: "Order Placed successfully",
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


exports.getAllOrdersByUser = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    let pageSize = req.query.pageSize;
    let currentPage = req.query.page;
    let select = req.query.select;
    let queryData;

    queryData = Order.find({ userId: userId });

    if (pageSize && currentPage) {
      queryData
        .skip(Number(pageSize) * (Number(currentPage) - 1))
        .limit(Number(pageSize));
    }

    const data = await queryData
      .select(select ? select : "")
      .sort({ createdAt: -1 })
      .populate("userId")

    const dataCount = await Order.countDocuments({ userId: userId }).populate(
      "checkouts"
    );

    res.status(200).json({
      data: data,
      count: dataCount,
      message: "Orders fecthed Successfully!",
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

exports.getOrderByUserOrderId = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    let id = req.query.id;
    let pageSize = req.query.pageSize;
    let currentPage = req.query.page;
    let select = req.query.select;
    let queryData;

    queryData = Order.find({ userId: userId, orderId: id })
      .populate(
        "orderedItems.productId"
      );

    if (pageSize && currentPage) {
      queryData
        .skip(Number(pageSize) * (Number(currentPage) - 1))
        .limit(Number(pageSize));
    }

    const data = await queryData
      .select(select ? select : "")
      .sort({ createdAt: -1 })

    const dataCount = await Order.countDocuments({ userId: userId, orderId: id });

    res.status(200).json({
      data: data,
      count: dataCount,
      message: "Orders fecthed Successfully!",
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

exports.getAllOrdersOfUserByAdmin = async (req, res, next) => {
  try {
    const userId = req.query.userId;

    let pageSize = req.query.pageSize;
    let currentPage = req.query.page;
    let select = req.query.select;
    let queryData;
    queryData = Order.find({ userId: userId });

    if (pageSize && currentPage) {
      queryData
        .skip(Number(pageSize) * (Number(currentPage) - 1))
        .limit(Number(pageSize));
    }

    const data = await queryData;
    //.select(select ? select : '').sort({createdAt: -1})
    // .populate('user')
    // .select('name')

    const dataCount = await Order.countDocuments({ userId: userId });

    res.status(200).json({
      data: data,
      count: dataCount,
      message: "Orders fetched Successfully!",
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

exports.getOrderDetailsById = async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const query = { _id: orderId };
    const data = await Order.findOne(query)
      .populate({
        path: "orderedItems.productId",
        model: "Product",
        select:
          "name slug sellingPrice medias images sku status vendor variants options variantFormArray variantDataArray canReturn returnPeriod",
      })
      .populate("userId");

    res.status(200).json({
      data: data,
      message: "Order Details fetched Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.cancelOrderByUser = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    let order = await Order.findById(orderId);

    if (
      order.deliveryStatus === enumObj.Order.PENDING &&
      order.paymentStatus === "unpaid"
    ) {
      order.deliveryStatus = enumObj.Order.CANCEL;
      await order.save();

      res.status(200).json({
        message: "Order has been canceled",
        status: 1,
      });
    } else {
      res.status(200).json({
        message: "You can't cancel this order. Please contact with seller",
        status: 0,
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getAllTransactionByUser = async (req, res, next) => {
  try {
    const userId = req.userData.userId;

    let pageSize = req.query.pageSize;
    let currentPage = req.query.page;
    let select = req.query.select;

    let data;
    let queryData;
    queryData = Order.find({
      $and: [
        { user: userId },
        {
          $or: [
            { deliveryStatus: enumObj.Order.DELIVERED },
            { paymentStatus: "paid" },
          ],
        },
      ],
    });

    if (pageSize && currentPage) {
      queryData
        .skip(Number(pageSize) * (Number(currentPage) - 1))
        .limit(Number(pageSize));
    }

    data = await queryData.select(select ? select : "").sort({ createdAt: -1 });

    const dataCount = await Order.countDocuments();

    res.status(200).json({
      data: data,
      count: dataCount,
      message: "Transaction get Successfully!",
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

exports.getAllOrdersByAdminV2 = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = Order.find(filter);
      countDoc = Order.countDocuments(filter);
    } else {
      queryDoc = Order.find();
      countDoc = Order.countDocuments();
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

    const data = await queryDoc.populate({
      path: "user",
      select: "fullName tag",
      populate: {
        path: "tag",
        select: "name images",
      },
    });

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

exports.getAllRequestOrdersByAdmin = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = requestOrder.find(filter);
      countDoc = requestOrder.countDocuments(filter);
    } else {
      queryDoc = requestOrder.find();
      countDoc = requestOrder.countDocuments();
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

    const data = await queryDoc.populate({
      path: "user",
      select: "fullName tag",
      populate: {
        path: "tag",
        select: "name images",
      },
    });

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

exports.getAllTransactionByAdmin = async (req, res, next) => {
  try {
    let pageSize = req.query.pageSize;
    let currentPage = req.query.page;
    let select = req.query.select;

    let data;
    let queryData;
    queryData = Order.find({
      $and: [
        {
          $or: [
            { deliveryStatus: enumObj.Order.DELIVERED },
            { paymentStatus: "paid" },
          ],
        },
      ],
    });

    if (pageSize && currentPage) {
      queryData
        .skip(Number(pageSize) * (Number(currentPage) - 1))
        .limit(Number(pageSize));
    }

    data = await queryData.select(select ? select : "").sort({ createdAt: -1 });

    const dataCount = await Order.countDocuments();

    res.status(200).json({
      data: data,
      count: dataCount,
      message: "Transaction get Successfully!",
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

exports.getOrdersBySearch = async (req, res, next) => {
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
    const queryArray2 = newQuery.map((str) => ({ phoneNo: RegExp(str, "i") }));
    const queryArray3 = newQuery.map((str) => ({ orderId: RegExp(str, "i") }));
    // const queryArray3 = newQuery.map((str) => ({phoneNo: RegExp(str, 'i')}));
    // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
    // const regex = new RegExp(query, 'i')

    let dataDoc;
    let countDoc;

    if (filter) {
      dataDoc = Order.find({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              { $and: queryArray3 },
              // {$and: queryArray4},
            ],
          },
        ],
      });

      countDoc = Order.countDocuments({
        $and: [
          filter,
          {
            $or: [
              { $and: queryArray },
              { $and: queryArray2 },
              { $and: queryArray3 },
              // {$and: queryArray4},
            ],
          },
        ],
      });
    } else {
      dataDoc = Order.find({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          { $and: queryArray3 },
          // {$and: queryArray4},
        ],
      });

      countDoc = Order.countDocuments({
        $or: [
          { $and: queryArray },
          { $and: queryArray2 },
          { $and: queryArray3 },
          // {$and: queryArray4},
        ],
      });
    }

    // {marketer: {$in: [null]}}

    if (pageSize && currentPage) {
      dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize));
    }

    const results = await dataDoc;
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

exports.getSingleOrderByUser = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate({
      path: "orderedBooks.bookId",
      model: "Book",
      select:
        "_id name slug image price discountPercent availableQuantity author authorName categoryName",
    });

    res.json({
      data: order,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Something went Wrong",
    });
    next(error);
  }
};

exports.getSingleOrderByAdmin = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("orderedItems.vendor");

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Somrthing went Wrong",
    });
    next(error);
  }
};

exports.getUserOrdersByAdmin = async (req, res, next) => {
  try {
    const order = await Order.find({ userId: req.params.userId });
    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.deleteOrderByAdmin = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    const userId = order.userId;

    await User.updateOne(
      { _id: userId },
      {
        $pull: { orders: order._id },
      }
    );

    await Order.findByIdAndDelete(req.params.orderId);

    res.json({
      message: "Order is deleted",
    });
  } catch (err) {
    // console.log(err)
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getAllCanceledOrdersByAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryStatus: 6 });
    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getAllOrdersByAdminNoPaginate = async (req, res, next) => {
  try {
    const order = await Order.find()
      .populate({
        path: "orderedItems.productId",
        model: "Product",
        select:
          "productName productSlug price category categorySlug subCategory subCategorySlug brand brandSlug images",
      })
      .sort({ createdAt: -1 });
    const message = "Successfully retrieved orders";

    res.status(200).json({
      data: order,
      message: message,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.updateMultipleOrder = async (req, res, next) => {
  const data = req.body;
  try {
    data.forEach((m) => {
      Order.findByIdAndUpdate(
        m._id,
        { $set: m },
        { new: true, multi: true }
      ).exec();
    });

    res.status(200).json({
      message: "Bulk Order Update Successfully!",
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

exports.changeDeliveryStatus = async (req, res, next) => {
  try {
    const deliveryStatus = req.body.deliveryStatus;

    const order = await Order.findOne({ _id: req.body._id }).populate("user");

    const smsData = {
      user: process.env.SMSUSER,
      pass: process.env.SMSPASS,
      msisdn: "88" + order.user.phoneNo,
      sms: "",
      sid: process.env.SMSSID,
      csmsid: order.user.phoneNo,
    };

    let updatePhase;
    let updatePhaseDate;
    let nextUpdatePhaseDate;

    switch (deliveryStatus) {
      case enumObj.Order.CONFIRM:
        updatePhase = "orderTimeline.orderPlaced";
        updatePhaseDate = "orderTimeline.orderPlacedDate";
        nextUpdatePhaseDate = "orderTimeline.orderProcessingDate";
        smsData.sms = `Dear ${order.user.fullName}, Your order ${order.orderId ? order.orderId : order._id
          } is confirmed. For Support: 8809610001010.`;
        break;
      case enumObj.Order.PROCESSING:
        updatePhase = "orderTimeline.orderProcessing";
        updatePhaseDate = "orderTimeline.orderProcessingDate";
        nextUpdatePhaseDate = "orderTimeline.orderPickedByDeliveryManDate";
        smsData.sms = `Dear ${order.user.fullName
          }, We have started processing your order ${order.orderId ? order.orderId : order._id
          }. For Support: 8809610001010.`;
        break;
      case enumObj.Order.SHIPPING:
        updatePhase = "orderTimeline.orderPickedByDeliveryMan";
        updatePhaseDate = "orderTimeline.orderPickedByDeliveryManDate";
        nextUpdatePhaseDate = "orderTimeline.orderDeliveredDate";
        smsData.sms = `Dear ${order.user.fullName
          }, We have handed over your order ${order.orderId ? order.orderId : order._id
          } to our delivery partner. Your product will be delivered soon.`;
        break;
      case enumObj.Order.DELIVERED:
        updatePhase = "orderTimeline.orderDelivered";
        updatePhaseDate = "orderTimeline.orderDeliveredDate";
        nextUpdatePhaseDate = "orderTimeline.othersDate";
        smsData.sms = `Dear ${order.user.fullName}, Your order ${order.orderId ? order.orderId : order._id
          } is now delivered. Thank you for shopping at www.esquireelectronicsltd.com.`;
        break;
      case enumObj.Order.CANCEL:
        updatePhase = "orderTimeline.others";
        updatePhaseDate = "orderTimeline.othersDate";
        nextUpdatePhaseDate = "orderTimeline.othersDate";
        smsData.sms = `Dear ${order.user.fullName}, Your order ${order.orderId ? order.orderId : order._id
          } is canceled. Please order again at www.esquireelectronicsltd.com.`;
        break;
      case enumObj.Order.REFUND:
        updatePhase = "orderTimeline.others";
        updatePhaseDate = "orderTimeline.othersDate";
        nextUpdatePhaseDate = "orderTimeline.othersDate";
        smsData.sms = `Dear ${order.user.fullName}, Your order ${order.orderId ? order.orderId : order._id
          } valued BDT ${order.totalAmount
          } is refunded to your account. The refund will take some days to reflect on your account statement. For Support: 8809610001010.`;
        break;
      default:
        updatePhase = "orderTimeline.others";
        updatePhaseDate = "orderTimeline.othersDate";
        nextUpdatePhaseDate = "orderTimeline.othersDate";
        smsData.sms =
          "Dear " +
          order.user.fullName +
          ", your order no. " +
          req.body._id +
          " has changed in status on " +
          req.body.updateDate +
          "please log into your account and check your order details. Esquire Electronics Limited.";
    }

    const updateDate = req.body.updateDate;
    const nextPhaseDate = req.body.nextPhaseDate;
    await Order.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          [updatePhase]: true,
          [updatePhaseDate]: updateDate,
          [nextUpdatePhaseDate]: nextPhaseDate,
          deliveryStatus: deliveryStatus,
        },
      }
    );

    /**
     * SMS SENT SSL
     */
    const apiEnd = "https://sms.sslwireless.com/pushapi/dynamic/server.php";
    ax.get(apiEnd, {
      params: smsData,
    })
      .then(function (response) {
        console.log("response:");
      })
      .catch(function (error) {
        console.log("error:");
      });

    // if (req.body.deliveryStatus === enumObj.Order.DELIVERED) {
    //     await Order.findOneAndUpdate({_id: req.body._id}, {$set: {paymentStatus: 'paid'}});
    //     const order = await Order.findOne({_id: req.body._id})
    //         .populate(
    //             {
    //                 path: 'orderedItems.productId',
    //                 model: 'Product',
    //                 select: 'soldQuantity quantity'
    //             }
    //         );
    //
    //     if (order && order.orderedItems.length) {
    //         const mOrderProducts = order.orderedItems.map(m => {
    //             return {
    //                 _id: m.product._id,
    //                 soldQuantity: m.quantity,
    //                 productSoldQty: m.product.soldQuantity,
    //                 productQty: m.product.quantity,
    //             }
    //         });
    //         mOrderProducts.forEach(m => {
    //             // Create Complex Query
    //             const q1 = incrementSoldQuantityQuery(m);
    //             const q2 = decrementQuantityQuery(m);
    //             let finalQuery;
    //             if (q1.$inc && q2.$inc) {
    //                 finalQuery = {$inc: {soldQuantity: q1.$inc.soldQuantity, quantity: q2.$inc.quantity}}
    //             } else {
    //                 finalQuery = {...q1, ...q2};
    //             }
    //
    //             // Update Product Data
    //             Product.updateOne({_id: m._id},
    //                 finalQuery,
    //                 {new: true, upsert: true, multi: true}).exec()
    //         });
    //     }
    //
    // }

    res.json({
      message: "Order status updated",
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

exports.filterByDynamicFilters = async (req, res, next) => {
  try {
    let limit = req.body.limit;
    const deliveryStatus = req.query.deliveryStatus;

    // const parent = req.body.parent;
    const queryData = await Order.find({ deliveryStatus: deliveryStatus });

    if (limit && limit.pageSize && limit.currentPage) {
      queryData
        .skip(limit.pageSize * (limit.currentPage - 1))
        .limit(limit.pageSize);
    }

    const dataCount = await Order.countDocuments({
      deliveryStatus: deliveryStatus,
    });

    const data = await queryData;

    res.status(200).json({
      data: data,
      count: dataCount,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.filterByDateRange = async (req, res, next) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const queryData = await Order.find({
      checkoutDate: { $gte: startDate, $lte: endDate },
    });

    if (limit && limit.pageSize && limit.currentPage) {
      queryData
        .skip(limit.pageSize * (limit.currentPage - 1))
        .limit(limit.pageSize);
    }

    const dataCount = await Order.countDocuments({ deliveryStatus: query });

    const data = await queryData;

    res.status(200).json({
      data: data,
      count: dataCount,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.updateOrderById = async (req, res, next) => {
  try {
    const order = req.body;
    const orderId = req.body._id;
    const queryData = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: order,
      }
    );

    // order.orderedItems.forEach(async (item) => {
    //   try {
    //     ///console.log("---------------------item.status",item.status)

    //     if (item.status == 1) {
    //       ///console.log("_--------------------------------------------------",item.orderType)

    //       // if (item.orderType == "regular") {

    //       var varData;
    //       const data = await Product.findOne({
    //         _id: item.product._id,
    //         variantFormArray: { $elemMatch: { variantSku: item.sku } },
    //       });

    //       data.variantFormArray.filter((i, index) => {
    //         if (i.variantSku == item.sku) {
    //           varData = data.variantFormArray[index];
    //         }
    //       });

    //       //const qt = (varData.variantQuantity - item.quantity) >0 ? (varData.variantQuantity - item.quantity) : 0

    //       await Product.findOneAndUpdate(
    //         { _id: item.product._id },
    //         {
    //           $set: {
    //             "variantFormArray.$[e1].variantQuantity": parseInt(
    //               varData.variantQuantity + item.quantity
    //             ),
    //             /// "variantFormArray.$[e1].variantQuantity": (item.quantity - item.oldQuantity) <= 0 ? 0 : -(item.quantity - item.oldQuantity),
    //           },
    //         },
    //         {
    //           arrayFilters: [
    //             {
    //               "e1.variantSku": item.sku,
    //               "e1.variantQuantity": { $gt: 0 },
    //             },
    //           ],
    //         }
    //       ).exec();
    //       // }
    //     } else if (item.status == 0) {
    //       console.log(item.oldQuantity);
    //       const qt =
    //         item.quantity - item.oldQuantity > 0
    //           ? item.quantity - item.oldQuantity
    //           : -(item.quantity - item.oldQuantity);

    //       await Product.findOneAndUpdate(
    //         { _id: item.product._id },
    //         {
    //           $inc: {
    //             "variantFormArray.$[e1].variantQuantity": -qt,
    //             /// "variantFormArray.$[e1].variantQuantity": (item.quantity - item.oldQuantity) <= 0 ? 0 : -(item.quantity - item.oldQuantity),
    //           },
    //         },
    //         {
    //           arrayFilters: [
    //             { "e1.variantSku": item.sku, "e1.variantQuantity": { $gt: 0 } },
    //           ],
    //         }
    //       ).exec();
    //       // }
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });

    res.status(200).json({
      message: "Order Updated Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.updateRequestOrderById = async (req, res, next) => {
  try {
    const order = req.body;
    const orderId = req.body._id;
    const queryData = await requestOrder.findOneAndUpdate(
      { _id: orderId },
      {
        $set: order,
      }
    );

    res.status(200).json({
      message: "Order Updated Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.testSslSmsApi = (req, res, next) => {
  const smsData = {
    user: process.env.SMSUSER,
    pass: process.env.SMSPASS,
    msisdn: "8801773253900",
    sms: "A test message from nodejs",
    sid: process.env.SMSSID,
    csmsid: "014578874512577895",
  };
  // GET
  // const apiEnd = "https://sms.sslwireless.com/pushapi/dynamic/server.php";
  // ax.get(apiEnd, {
  //     params: smsData
  // }).then(function (response) {
  //         console.log("response:");
  //         console.log(response.data);
  //         res.status(200).json({
  //             success: true,
  //         });
  //     })
  //     .catch(function (error) {
  //         console.log("error:");
  //         res.status(200).json({
  //             success: false,
  //         });
  //         console.log(error);
  //     });

  var apiEnd = "https://sms.sslwireless.com/pushapi/dynamic/server.php";
  let payload =
    "user=" +
    encodeURI(smsData.user) +
    "&pass=" +
    encodeURI(smsData.pass) +
    "&sid=" +
    encodeURI(smsData.sid) +
    "&sms[0][0]=" +
    smsData.msisdn +
    "&sms[0][1]=" +
    encodeURI(smsData.sms) +
    "&sms[0][2]=" +
    smsData.csmsid +
    "";
  ax.defaults.headers.post["Content-Type"] =
    "application/x-www-form-urlencoded";
  ax.post(apiEnd, payload)
    .then(function (response) {
      console.log("response::");
      // console.log(response.data);
      res.status(200).json({
        success: true,
      });
    })
    .catch(function (error) {
      console.log("error::");
      res.status(200).json({
        success: false,
      });
    });
};

exports.getSelectedOrderDetails = async (req, res, next) => {
  try {
    const selectedIds = req.body.selectedIds;

    const data = await Order.find({ _id: { $in: selectedIds } });

    res.status(200).json({
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateSessionKey = async (req, res, next) => {
  try {
    const tranId = req.params.tranId;
    const sessionkey = req.params.sessionkey;
    const tempOrder = await OrderTemp.updateOne(
      { _id: tranId },
      { $set: { sessionkey: sessionkey } }
    );

    res.json({
      message: "Session Key Updated Successfully!",
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

/**
 * ADDITIONAL FUNCTIONS
 */
function padLeadingZeros(num) {
  return 'SO'+String(num).padStart(4, "0");
}

function incrementSoldQuantityQuery(item) {
  let query;
  if (item.productSoldQty) {
    query = {
      $inc: {
        soldQuantity: item.soldQuantity ? item.soldQuantity : 1,
      },
    };
  } else {
    query = {
      $set: {
        soldQuantity: item.soldQuantity ? item.soldQuantity : 1,
      },
    };
  }
  return query;
}

function decrementQuantityQuery(item) {
  let query;
  if (item.productQty) {
    query = {
      $inc: {
        quantity: -(item.soldQuantity ? item.soldQuantity : 1),
      },
    };
  } else {
    query = {
      $set: {
        quantity: -(item.soldQuantity ? item.soldQuantity : 1),
      },
    };
  }

  return query;
}

exports.getAllOrdersByAdmin = async (req, res, next) => {
  try {
    let paginate = req.body.paginate;
    let filter = req.body.filter;
    let sort = req.body.sort;
    let select = req.body.select;

    let queryDoc;
    let countDoc;

    // Filter
    if (filter) {
      queryDoc = Order.find(filter);
      countDoc = Order.countDocuments(filter);
    } else {
      queryDoc = Order.find();
      countDoc = Order.countDocuments();
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

    const data = await queryDoc.populate({
      path: 'userId',
      select: 'fullName phoneNo email checkouts'
    });

    const count = await countDoc;
    res.status(200).json({
      data: data,
      count: count
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


exports.updateProductQuantityByOrderId = async (req, res, next) => {
  try {
    const order = req.body.orderStatus;
    const orderId = req.body._id;
    const orderData = await Order.findById(orderId);

    order.orderedItems.forEach(async (item) => {
      try {

        if (item.status == 1) {
          var varData;
          const data = await Product.findOne({
            _id: item.product._id,
            variantFormArray: { $elemMatch: { variantSku: item.sku } },
          });

          data.variantFormArray.filter((i, index) => {
            if (i.variantSku == item.sku) {
              varData = data.variantFormArray[index];
            }
          });

          await Product.findOneAndUpdate(
            { _id: item.product._id },
            {
              $set: {
                "variantFormArray.$[e1].variantQuantity": parseInt(
                  varData.variantQuantity + item.quantity
                ),
                /// "variantFormArray.$[e1].variantQuantity": (item.quantity - item.oldQuantity) <= 0 ? 0 : -(item.quantity - item.oldQuantity),
              },
            },
            {
              arrayFilters: [
                {
                  "e1.variantSku": item.sku,
                  "e1.variantQuantity": { $gt: 0 },
                },
              ],
            }
          ).exec();
          // }
        } else if (item.status == 0) {
          const qt =
            item.quantity - item.oldQuantity > 0
              ? item.quantity - item.oldQuantity
              : -(item.quantity - item.oldQuantity);


          await Product.findOneAndUpdate(
            { _id: item.product._id },
            {
              $inc: {
                "variantFormArray.$[e1].variantQuantity": -qt,
                /// "variantFormArray.$[e1].variantQuantity": (item.quantity - item.oldQuantity) <= 0 ? 0 : -(item.quantity - item.oldQuantity),
              },
            },
            {
              arrayFilters: [
                { "e1.variantSku": item.sku, "e1.variantQuantity": { $gt: 0 } },
              ],
            }
          ).exec();
          // }
        }
      } catch (err) {
        console.log(err);
      }
    });

    res.status(200).json({
      message: "Order Updated Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};