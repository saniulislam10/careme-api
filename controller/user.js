// Require Main Modules..
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const User = require('../models/user');
const Address = require('../models/address');
const mongoose = require('mongoose');
const Coupon = require("../models/coupon");


/**
 * User Registration
 * User Login
 */

 exports.userRegistrationDefault = async (req, res, next) => {
    const errors = validationResult(req);
    // Check Input validation Error with Error Handler..
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }
    
    try {
        const bodyData = req.body;
        const query = {phoneNo: bodyData.phoneNo};

        console.log('registration',bodyData);

        let token;

        const userExists = await User.findOne(query).lean();

        if (userExists) {
            token = jwt.sign({
                    username: userExists.username,
                    userId: userExists._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '90d'
                }
            );

            res.status(200).json({
                message: 'Welcome! Login Success',
                success: true,
                token: token,
                expiredIn: 7776000000
            })

        } else {
            const user = new User(bodyData);
            const newUser = await user.save();

            token = jwt.sign({
                    username: newUser.username,
                    userId: newUser._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '90d'
                }
            );

            res.status(200).json({
                message: 'Registration Success.',
                success: true,
                token: token,
                expiredIn: 7776000000
            })
        }

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

// Login User..
exports.userLoginDefault = async (req, res, next) => {

    try {
        const username = req.body.username;
        const password = req.body.password;

        let loadedUser;
        let token;
        const user = await User.findOne({username: username})

        if (!user) {
            res.status(200).json({
                message: 'A User with this phone or email no could not be found!',
                success: false
            });
        } else if (user.hasAccess === false) {
            res.status(200).json({
                message: 'Ban! Your account has been banned',
                success: false
            });
        } else {
            loadedUser = user;
            const isEqual = await bcrypt.compareSync(password, user.password);
            if (!isEqual) {
                res.status(200).json({
                    message: 'You entered a wrong password!',
                    success: false
                });
            } else {
                token = jwt.sign({
                        username: loadedUser.username,
                        userId: loadedUser._id
                    },
                    process.env.JWT_PRIVATE_KEY, {
                        expiresIn: '90d'
                    }
                );
                res.status(200).json({
                    success: true,
                    message: 'Welcome back. Login Success',
                    token: token,
                    expiredIn: 7776000000
                })
            }

        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.userFirebaseAuth = async (req, res, next) => {

    try {
        const bodyData = req.body;
        const user = new User(bodyData);
        let token;


        const userExists = await User.findOne({ username: bodyData.username}).lean();

        if (userExists) {
            // When User Already Exists
            token = jwt.sign({
                    username: userExists.username,
                    userId: userExists._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '90d'
                }
            );

            res.status(200).json({
                message: 'Login Success',
                success: true,
                token: token,
                expiredIn: 7776000000
            })
        } else {
            // When User Not Exists
            const newUser = await user.save();

            token = jwt.sign({
                    username: newUser.username,
                    userId: newUser._id
                },
                process.env.JWT_PRIVATE_KEY, {
                    expiresIn: '90d'
                }
            );

            res.status(200).json({
                message: 'Login Success',
                success: true,
                token: token,
                expiredIn: 7776000000
            })
        }

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.getLoginUserInfo = async (req, res, next) => {
    try {
        const loginUserId = req.userData.userId;
        const selectString = req.query.select;

        let user;

        if (selectString) {
            user = User.findById(loginUserId).select(selectString)
            .populate('tag')
        } else {
            user = User.findById(loginUserId).select('-password')
        }
        const data = await user;

        res.status(200).json({
            data: data,
            message: 'Successfully Get user info.'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editLoginUserInfo = async (req, res, next) => {
    try {
        const loginUserId = req.body._id;
        await User.findOneAndUpdate(
            {_id: loginUserId},
            {$set: req.body}
            );

        res.status(200).json({
            message: 'Successfully Updated user info.'
        })
    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.checkUserByPhone = async (req, res, next) => {

    const phoneNo = req.params.phoneNo;

    try {

        if (await User.findOne({username: phoneNo})) {
            res.status(200).json({
                data: true,
                message: 'Check Your Phone & Enter OTP Below!'
            });
        } else {
            res.status(200).json({
                data: false,
                message: 'No Account Exists With This Phone Number!'
            });
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


/**
 * USER CONTROL BY ADMIN
 */
exports.getUserLists = async (req, res, next) => {
    try {

        const paginate = req.body.paginate;
        const filter = req.body.filter;

        const select = req.query.select;
        let query;
        if (filter) {
            query = User.find(filter)
        } else {
            query = User.find()
        }

        if (paginate) {
            query.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        // const count = await User.countDocuments(filter ? filter : {});
        const data = await query.sort({createdAt: -1}).select(select ? select : '');


        res.status(200).json({
            count: count,
            data: data
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

exports.getUserByUserId = async (req, res, next) => {

    try {

        const userId = req.params.userId;
        const user = await User.findOne({_id: userId})
        .populate({
            path: 'checkouts',
            select: 'orderTimeline totalAmount name images',
           
        })
        .populate({
            path: 'tag',
            populate: {
                path: 'tag',
              } 
        })
        // .populate({ path: 'carts -_id', populate: { path: 'product', select: 'productName sku productSlug categorySlug price discountType discountAmount  quantity images' } })
        // .populate(
        //     {
        //         path: 'wishlists -_id',
        //         populate: {
        //             path: 'product',
        //             select: 'productName sku productSlug categorySlug brandSlug price discountType discountAmount  quantity images'
        //         }
        //     })

        res.status(200).json({
            data: user,

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

/**
 * Password
 */

 exports.editPassword = async (req, res, next) => {
    const phoneNo = req.body.phoneNo;
    const hashedPass = bcrypt.hashSync(req.body.password, 8);

    try {

        await User.findOneAndUpdate({phoneNo: phoneNo}, {$set: {password: hashedPass}});

        res.status(200).json({
            message: 'Password Reset Successfully!'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.updatePassword = async (req, res, next) => {

    const userId = req.userData.userId;

    try {
        const userData = await User.findOne({_id: userId}).select('password');

        const isEqual = await bcrypt.compareSync(req.body.oldPassword, userData.password);

        if (isEqual) {
            const newPassword = bcrypt.hashSync(req.body.newPassword, 8);
            await User.findOneAndUpdate({_id: userId}, {$set: {password: newPassword}});
            // message = "Password Reset Successfully!"
            res.status(200).json({
                success: true,
                message: "Password Reset Successfully!"
            });
        } else {
            res.status(200).json({
                success: false,
                message: "Your old Password is Wrong!"
            });
        }

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

/**
 * ADDRESS
 */

exports.addAddress = async (req, res, next) => {

    try {
        const userId = req.userData.userId;
        const data = req.body;
        const final = {...data, ...{user: userId}}
        const newAddress = new Address(final);
        const address = await newAddress.save();

        await User.findOneAndUpdate({ _id: userId }, { $push: { addresses: address._id } });

        res.status(200).json({
            message: 'Successfully added address'
        })

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getAddresses = async (req, res, next) => {

    try {
        const userId = req.userData.userId;

        let pageSize = req.query.pageSize;
        let currentPage = req.query.page;
        let select = req.query.select;

        let queryData;
        let data;


        if (pageSize && currentPage) {

            queryData = User.findOne({_id: userId})
                .select('addresses -_id')
                .populate({
                    path: 'addresses',
                    // select: 'addresses',
                    model:'Address',
                    populate: {
                        path: "city",
                        model: "city",
                    },
                    options: {
                        sort:{createdAt: -1},
                        skip: Number(pageSize) * (Number(currentPage) - 1),
                        limit : Number(pageSize)
                    },
                })
        } else {
            queryData = User.findOne({_id: userId})
                .select('addresses -_id')
                .populate({
                    path: 'addresses',
                    model:'Address',
                    populate: ([{
                        path: "thana",
                        model: "Thana",
                    },{
                        path: "city",
                        model: "city",
                    },{
                        path: "zila",
                        model: "zila",
                    }]),
                    
                    options: {
                        sort:{createdAt: -1}
                    }
                })
        }

        data = await queryData;

        // COUNT IN POPULATE ARRAY
        const id = mongoose.Types.ObjectId(userId);
        const dataCount = await User.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {$project: { count: { $size: "$addresses" }}}
        ])

        res.status(200).json({
            data: data.addresses ? data.addresses : null,
            count: dataCount && dataCount.length > 0 ? dataCount[0].count : 0,
            message: 'Order get Successfully!'
        });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}

exports.editUserAddress = async (req, res, next) => {

    try {
        const bodyData = req.body;

        await Address.updateOne(
            {_id: bodyData._id},
            {$set: bodyData}
        )
        res.status(200).json({
            message: 'Address updated Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.deleteUserAddress = async (req, res, next) => {

    try {
        const userId = req.userData.userId;
        const id = req.params.id;

        await Address.deleteOne({_id: id});

        await User.findByIdAndUpdate({_id: userId}, {$pull: {addresses: id}});

        res.status(200).json({
            message: 'Address deleted Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

/**
 * Admin
 */
exports.editUserAccess = async (req, res, next) => {

    try {
        const bodyData = req.body;
        const userId = req.params.id;

        await User.updateOne(
            {_id: userId},
            {$set: bodyData}
        )
        res.status(200).json({
            message: 'User Access updated Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


/**
 * USER SEARCH
 */
exports.getUsersBySearch = async (req, res, next) => {
    try {
        const searchQuery = req.query.q;
        const aggregateStages = [];

        if (searchQuery) {
            mFilter = {
              $and: [
                {
                  $or: [
                    { fullName: { $regex: searchQuery, $options: "i" } },
                    { phoneNo: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                    { username: { $regex: searchQuery, $options: 'i' } },
                  ],
                }
            ],
            };
          }

        if (Object.keys(mFilter).length) {
            aggregateStages.push({ $match: mFilter });
          }

        const dataAggregates = await User.aggregate(aggregateStages);
        
        res.status(200).json({
            data: dataAggregates,
            success: true,
            message: "Success",
            count: dataAggregates.length,
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
