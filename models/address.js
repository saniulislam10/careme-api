const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const addressSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        city: {
            type: Schema.Types.ObjectId,
            ref: 'city',
            required: true
        },
        thana: {
            type: Schema.Types.ObjectId,
            ref: 'thana',
            required: true
        },
        zila: {
            type: Schema.Types.ObjectId,
            ref: 'zila',
            required: true
        },
        address: {
            type: String,
            required: false
        },
        addressType: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('Address', addressSchema);
