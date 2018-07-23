var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var randomstring = require('randomstring')
let DEFAULT_USER_PICTURE = '/images/defaultAvatart.png';

UserSchema = mongoose.Schema({
    _id: {
      type: String
    },
    fullName :{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    socialId: {
        type: String,
        default: null
    },
    picture:  {
        type: String,
        default:  DEFAULT_USER_PICTURE
    },
    phone:{
        type: Number
    },
    role: {
        type: String,
        enum: ['admin', 'driver', 'user']
    },
    createAt:{
        type: Date,
        default: Date.now
    },
    isActive:{
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', function(next) {
    var user = this;

    if(!user.picture){
        user.picture = DEFAULT_USER_PICTURE;
    }
    user._id = randomstring.generate({
       length:16,
       charset:'alphanumeric'
    });
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});
UserSchema.pre('update', function(next) {
    var user = this;

    if(!user.picture){
        user.picture = DEFAULT_USER_PICTURE;
    }

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};
// UserSchema.methods.validatePassword = function(password) {
//     return bcrypt.compareSync(password, this.password);
// };
module.exports = mongoose.Schema('User',UserSchema);

