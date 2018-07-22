var winston = require('winston');

var logger = winston.createLogger({
    transports: [
        new (winston.transports.File)({
            level: 'debug',
            json: true,
            filename: './debug.log',
            handleExceptions: true
        }),
        new (winston.transports.Console)({
            level: 'debug',
            json: true,
            handleExceptions: true
        })
    ],
    exitOnError: false
});

module.exports = logger;