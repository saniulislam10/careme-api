const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
      
        lessThanZero: {
            type: String,
            required: false
        },
        zero: {
            type: String,
            required: false
        },
        greaterThanZero: {
            type: String,
            required: false
        },
        
    },
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = mongoose.model('StockControl', schema);
