var config 	= require('../config');
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');

var processEvent = (io) =>{

};

var init = (app) =>{

    let server 	= require('http').Server(app);
    let io 		= require('socket.io')(server);
    io.set('transports', ['websocket']);

    let port = config.redis.port;
    let host = config.redis.host;
    let password = config.redis.password;
    let pubClient = redis(port, host, { auth_pass: password });
    let subClient = redis(port, host, { auth_pass: password, return_buffers: true, });
    io.adapter(adapter({ pubClient, subClient }));

    // Cho phép socket truy cập dữ liệu phiên
    io.use((socket, next) => {
        require('../session')(socket.request, {}, next);
    });


    processEvent(io);

    return server;
};

module.exports = init;