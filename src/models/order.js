var mongoose = require('mongoose');
var randomstring = require('randomstring');
var OrderSchema =new mongoose.Schema({
   _id:{
       type: String
   },
    userId:{
        type: String,
        required: true
    },

    driverId: {
        type: String,
        required: true
    },

    location:{
       type: String,
        required: true
    },
    destination:{
       type: String,
        required: true
    },
    price: {
       type: Number,
        required: true
    },
    createAt:{
       type:Date,
        default: Date.now
    }
},{_id: false});
OrderSchema.pre('save',function (next) {
    let order = this;
    order._id = randomstring.generate({
        length:16,
        charset:'alphanumeric'
    });
    next();
});
module.exports = mongoose.model('Order',OrderSchema);