
var config 		= require('../config');
var passport 	= require('passport');
var logger 		= require('../logger');
var userRepository = require('../repository/userRepository');
var LocalStrategy 		= require('passport-local').Strategy;
var FacebookStrategy  	= require('passport-facebook').Strategy;
var TwitterStrategy  	= require('passport-twitter').Strategy;

var option = {
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
};

var initPassport = () => {

    passport.serializeUser( (user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id,done) => {
        var user =await userRepository.findById(id);
        done(null,user);
    });

    passport.use('local-login',new LocalStrategy(option,(req, email,password, done)=>{
        console.log('email: '+email+' Password: '+ password);
        let user = async () => {
            let userStore = await userRepository.findOne({'email': RegExp(email, 'i')},{socialId: null});
            if (!userStore){
                return done(null,false,{message: 'Incorrect email' });
            }
            userStore.validatePassword(password, function(err, isMatch) {
                if (err) { return done(err); }
                if (!isMatch || !userStore.isActive){
                    return done(null, false, { message: 'Incorrect password or account not active' });
                }
                return done(null, userStore);
            });

        };
        user().catch( e => console.log(e));
    }));
    return passport;
};

module.exports = initPassport();