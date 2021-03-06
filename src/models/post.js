var mongoose = require('mongoose');
var randomstring = require('randomstring');
var PostSchema =new mongoose.Schema({
    _id: {
        type: String
    },
    userId: {
       type: String,
       required: true
   },
    totalDistance:{
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    destination: {
      type: String,
      required: true
    },
    status:{
        type: String
    },
    createAt:{
        type: Date,
        default: Date.now
    },
    bid: {
        type:[{
            fullName:String,
            driverId: String,
            price: Number,
            awaitTime: Date
        }],
        ref:'BID'
    },
    init_money: {
      type: Number,
      required: true
    },
    expiredTime:{
        type: Date,
        required: true
    }
},{_id:false});

PostSchema.pre('save',function (next) {
    let post = this;
    post._id = randomstring.generate({
        length:16,
        charset:'alphanumeric'
    });
    next();
});

module.exports = mongoose.model('Post',PostSchema);