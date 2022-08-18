const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
      
        name: {
            type: String,
            required: false
        },
        parentCategory:{
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        },
        childCategory:[{
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: false
        }],
        products:[{
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: false
        }],
        images: {
            type: String,
            required: false
        },
        
    },
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = mongoose.model('SizeChart', schema);
