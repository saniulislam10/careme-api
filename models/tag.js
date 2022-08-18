const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
      
        name: {
            type: String,
            required: false
        },
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

module.exports = mongoose.model('Tag', schema);
