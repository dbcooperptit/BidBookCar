var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var randomstring = require('randomstring')
const DEFAULT_USER_PICTURE = '/images/defaultAvatar.jpg';
const SALT_WORK_FACTOR = 10;
var UserSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    fullName: {
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
    picture: {
        type: String,
        default: DEFAULT_USER_PICTURE
    },
    phone: {
        type: Number
    },
    role: {
        type: String,
        enum: ['admin', 'driver', 'user'],
        default: 'user'
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { _id: false });

UserSchema.pre('save', function (next) {
    var user = this;

    if (!user.picture) {
        user.picture = DEFAULT_USER_PICTURE;
    }
    user._id = randomstring.generate({
        length: 16,
        charset: 'alphanumeric'
    });
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});
// UserSchema.pre('update', function(next) {
//     var user = this;
//     console.log('is pre update: '+password);

//     if (!this.isModified('password')) return next();

//     bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//         if (err) return next(err);

//         bcrypt.hash(user.password, salt, null, function(err, hash) {
//             if (err) return next(err);
//             user.password = hash;
//             next();
//         });
//     });
// });
UserSchema.methods.generateHasPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);

UserSchema.methods.validatePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};
module.exports = mongoose.model('User', UserSchema);

