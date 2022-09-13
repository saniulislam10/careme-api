const { validationResult } = require("express-validator");
const utils = require("../helpers/utils");

// Require Post Schema from Model..
const Cart = require("../models/cart");
const AbandonedCart = require("../models/abandoned-cart");
const User = require("../models/user");
const Product = require("../models/product");
const UniqueId = require("../models/unique-id");
const ObjectId = require('mongoose').Types.ObjectId;

exports.addToCart = async (req, res, next) => {
  const userId = req.userData.userId;
  const data = req.body;
 

  try {

    const product = await Product.findOne({'_id':data.product})
    if(product.hasVariant){

      let Vindex;
      product.variantFormArray.map((q, index) => {
        if (q.variantSku == data.variant.variantSku) {
          return (
            this.Vindex = index
          )
        }
      })
        
      let v = (Object.values(product?.variantDataArray[this.Vindex]).toString()).replace(',', '/')
      data.variant.variant = v;
    }
    
    const final = { ...data, ...{ user: userId } };

    const cart = new Cart(final);
    const cartRes = await cart.save();

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          carts: cartRes._id,
        },
      }
    );
    res.status(200).json({
      message: "Added to Cart Successfully!",
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

exports.editVariantInCart = async (req, res, next) => {
  const data = req.body;

 

  try {

    const product = await Product.findOne({_id: data.productId})
    console.log(data.productId)
    let Vindex;
    product.variantFormArray.map((q, index) => {
      if (q.variantSku == data.variant.variantSku) {
        return (
          this.Vindex = index
        )
      }
    })

    let v = (Object.values(product?.variantDataArray[this.Vindex]).toString()).replace(',', '/')
    let updatedVariant = [];
    updatedVariant[0] = data.variant;
    updatedVariant[0].variant = v

    console.log(data.id)
    await Cart.findOneAndUpdate(
      { _id: data.id },
      {
        variant: updatedVariant,
        selectedQty: 1
      }
    );
    res.status(200).json({
      message: "Variant Edited Successfully!",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = err;
    }
    next(err);
  }
};

exports.getCartItemByUserId = async (req, res, next) => {
  const userId = req.userData.userId;

  try {
    const data = await User.findOne({ _id: userId })
      .populate({
        path: "carts",
        populate: {
          path: "product",
          select:
            "name slug vendor sellingPrice tax sku medias images hasTax redeemPointsType redeemPoints earnPointsType earnPoints canEarnPoints canRedeemPoints partialPaymentType partialPayment canPartialPayment hasVariant variants options variantFormArray variantDataArray",
        },
      })
      .select("carts");
  
      console.log(data);
    res.status(200).json({
      data: data && data.carts ? data.carts : [],
      message: "All Products Fetched Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getCartItemTypeByUserId = async (req, res, next) => {
  const userId = req.userData.userId;
  console.log('user id : ', userId);

  try {
    const data = await User.findOne({ _id: userId })
      .populate({
        path: "carts",
        populate: {
          path: "product",
          select:
            "name slug sellingPrice tax sku medias images hasTax redeemPointsType redeemPoints earnPointsType earnPoints canEarnPoints canRedeemPoints partialPaymentType partialPayment canPartialPayment hasVariant variantFormArray",
        },
      })
      .select("carts");

    let type = "regular";

    res.status(200).json({
      data: type,
      message: "Cart item type fetched Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.incrementCartQty = async (req, res, next) => {
  try {
    const cartId = req.body.cartId;

    const cart = await Cart.findOne({ _id: cartId }).populate({
      path: "product",
      select: "_id quantity trackQuantity continueSelling",
    });
    if (cart.variant.length) {
      if ((cart.variant[0].variantContinueSelling === true && cart.variant[0].variantQuantity > cart.selectedQty) || cart.variant[0].variantQuantity === 0 || cart.variant[0].variantQuantity === 0) {
        await Cart.findOneAndUpdate(
          { _id: cartId },
          { $inc: { selectedQty: 1 } },
          { new: true }
        );
        res.status(200).json({
          message: "Update cart quantity Successfully!",
        });

      } else {
        if (cart.variant[0].variantQuantity > cart.selectedQty) {
          await Cart.findOneAndUpdate(
            { _id: cartId },
            { $inc: { selectedQty: 1 } },
            { new: true }
          );
          res.status(200).json({
            message: "Update cart quantity Successfully!",
          });
        } else {
          res.status(200).json({
            msg: "Cannot add more than stock quantity",
          });
        }
      }

    } else {
      if (cart.requestProduct !== true) {
        if (cart.product.continueSelling === true) {
          await Cart.findOneAndUpdate(
            { _id: cartId },
            { $inc: { selectedQty: 1 } },
            { new: true }
          );
          res.status(200).json({
            message: "Update cart quantity Successfully!",
          });
        } else {
          if (cart.product.quantity > cart.selectedQty) {
            await Cart.findOneAndUpdate(
              { _id: cartId },
              { $inc: { selectedQty: 1 } },
              { new: true }
            );
            res.status(200).json({
              message: "Update cart quantity Successfully!",
            });
          } else {
            res.status(200).json({
              msg: "Cannot add more than stock quantity",
            });
          }
        }
      } else {
        await Cart.findOneAndUpdate(
          { _id: cartId },
          { $inc: { selectedQty: 1 } },
          { new: true }
        );
        res.status(200).json({
          message: "Update cart quantity Successfully!",
        });
      }
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

exports.decrementCartQty = async (req, res, next) => {
  const cartId = req.body.cartId;

  try {
    await Cart.findOneAndUpdate(
      { _id: cartId },
      { $inc: { selectedQty: -1 } },
      { new: true }
    );
    res.status(200).json({
      message: "Update cart quantity Successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  const cartId = req.params.cartId;
  const userId = req.userData.userId;

  try {
    const query = { _id: cartId };
    await Cart.deleteOne(query);

    await User.updateOne(
      { _id: userId },
      {
        $pull: { carts: { $in: cartId } },
      }
    );

    res.status(200).json({
      message: "Item Removed Successfully From Cart!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.deleteUserCartList = async (req, res, next) => {

  const userId = req.userData.userId;

  try {
    await Cart.deleteMany({ user: userId });

    // await User.updateOne(
    //   { _id: userId },
    //   {
    //     $pull: { carts: { $in: cartId } },
    //   }
    // );

    res.status(200).json({
      message: "Item Removed Successfully From Cart!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getCartItemCount = async (req, res, next) => {
  const userId = req.userData.userId;

  try {
    const cartsId = await User.findOne({ _id: userId }).distinct("carts");

    res.status(200).json({
      data: cartsId.length,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getSingleCartProduct = async (req, res, next) => {
  const userId = req.userData.userId;
  const productId = req.params.productId;

  try {
    const data = await Cart.findOne({
      user: userId,
      product: productId,
    }).select("selectedQty");

    res.status(200).json({
      data: data,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.addToAbandonedCart = async (req, res, next) => {
  try {
    const incAbandoned = await UniqueId.findOneAndUpdate(
      {},
      { $inc: { abandonedId: 1 } },
      { new: true, upsert: true }
    );
    const abandonedIdUnique = padLeadingZeros(incAbandoned.abandonedId);
    const finalData = {
      ...req.body,
      ...{ abandonedId: abandonedIdUnique },
    };

    const dataSchema = new AbandonedCart(finalData);
    await dataSchema.save();

    res.status(200).json({
      message: "Size Chart Added Successfully!",
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

exports.getAllAbandonedCart = async (req, res, next) => {
  try {
    const data = await AbandonedCart.find().populate({
      path: "user",
    });

    res.status(200).json({
      data: data,
      message: "Size Chart Added Successfully!",
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

exports.updateCart = async (req, res, next) => {
  try {
    const cartId = req.body.cartId;

    await Cart.findOneAndUpdate({ _id: cartId }, { $set: { ...req.body } });
    res.status(200).json({
      success: true,
      message: "Cart updated",
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

exports.updateCartMultiple = async (req, res, next) => {
  try {
    const cartIds = req.body.cartIds;
    const {data} = req.body;
    const mIds = cartIds.map((m) => new ObjectId(m));

    await Cart.updateMany(
        { _id: { $in: mIds } },
        { $set: data },
    );


    // await Cart.findOneAndUpdate({ _id: cartId }, { $set: { ...req.body } });
    res.status(200).json({
      success: true,
      message: "Cart updated",
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
  return String(num).padStart(4, "0");
}


