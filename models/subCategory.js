const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: false
    },
    tags: {
        type: String,
        required: false
    },
    count: {
        type: Number,
        required: false
    },
    
    parent: {
        type: Schema.Types.ObjectId,
        required: false
    },



}, {
    timestamps: true
});


module.exports = mongoose.model('SubCategory', schema);
