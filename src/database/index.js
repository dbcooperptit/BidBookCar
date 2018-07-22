var Mongoose = require("mongoose");
var config = require('../config');
var mongoDatabase = () =>{

    let dbURI = "mongodb://" +
        //encodeURIComponent(config.db.username) + ":" +
        //encodeURIComponent(config.db.password) + "@" +
        config.db.host + ":" +
        config.db.port + "/" +
        config.db.name;
    Mongoose.connect(dbURI);

    Mongoose.connection.on('error', function(err) {
        if(err) throw err;
    });
    Mongoose.Promise = global.Promise;

};

module.exports = mongoDatabase;