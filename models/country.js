const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Country', schema);
