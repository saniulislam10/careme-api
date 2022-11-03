const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subSchema = require("./sub-schema-model");

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    shippingZonesArray: [
        {
            zones: [
                // {
                //     zoneId: {
                //         type: Schema.Types.ObjectId,
                //         ref: 'zila',
                //         required: true
                //     },
                //     name: {
                //         type: String,
                //         required: false
                //     },
                // }
            ],
            name: {
                type: String,
                required: true
            },
            chooseRateType: {
                type: String,
                required: true
            },
            flatRate: {
                type: Number,
                required: false
            },
            baseRate: {
                type: Number,
                required: false
            },
            perKgRate: {
                type: Number,
                required: false
            },
        }
    ]

}, {
    timestamps: true
});


module.exports = mongoose.model('ShippingProfile', schema);
