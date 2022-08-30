const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    adjustmentId: {
        type: String,
        required: false,
        unique: true,
    },
    dateTime: {
        type: Date,
        required: false
    },
    reason: {
        type: String,
        required: false
    },
    products: [],
    total: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Adjustment', schema);
