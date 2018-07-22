var session 	= require('express-session');
var MongoStore	= require('connect-mongo')(session);
var db 		    = require('../database');
var config 		= require('../config');

var initSession = function () {
    if(process.env.NODE_ENV === 'production') {
        return session({
            secret: config.sessionSecret,
            resave: false,
            saveUninitialized: false,
            unset: 'destroy',
            store: new MongoStore({ mongooseConnection: db.Mongoose.connection })
        });
    } else {
        return session({
            secret: config.sessionSecret,
            resave: false,
            unset: 'destroy',
            saveUninitialized: true
        });
    }
}

module.exports = initSession();