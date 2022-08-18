const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.orderItem = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: false
        },
        sku: {
            type: String,
            required: false
        },
        discountType: {
            type: Number,
            required: false
        },
        discountAmount: {
            type: Number,
            required: false
        },
        quantity: {
            type: Number,
            required: true
        },
        orderType: {
            type: String,
            required: true
        },
        status: {
            type: Number,
            required: true
        }
    },
    {
        _id: true
    }
);
exports.orderStatus=new Schema({
    status:{
        type:String,
        required:true
    },
    adminInfo:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    dateTime:{
        type:Date,
        required:false
    },
    statusNote:{
        type:String,
        required:false
    },
    sku:{
        type:String,
        required:false
    },

})


exports.tagStatus = new Schema({
    tag:{
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        required: false
    },
    activationdate:{
        type:String,
        required:true
    }
},
{
    _id: true
})