const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
   
    name: {
        type: String,
        required: true
    },
    cityname: {
        type: Schema.Types.ObjectId,
        ref: 'city'
    },
    zilaname: {
        type: Schema.Types.ObjectId,
        ref: 'zila'
    },
   
}, {
    timestamps: true
});


module.exports = mongoose.model('Thana', schema);
