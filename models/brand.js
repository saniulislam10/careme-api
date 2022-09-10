const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: false
    },
    logo: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Brand', schema);
