var mongoose = require('mongoose');
var randomstring = require('randomstring');

ConfirmSchema = mongoose.Schema({
   _id:{
       type: String
   } ,
    postId: {
       type: String
    },
    userId: {
       type: String
    },
    driverId:{
       type:String
    }
});

ConfirmSchema.pre('save',function (next) {
    let order = this;
    order._id = randomstring.generate({
        length:16,
        charset:'alphanumeric'
    });
    next();
});

module.exports = mongoose.model('ConfirmTemp',ConfirmSchema);