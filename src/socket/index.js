var config 	= require('../config');
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');
var Post = require("../models/post");
var postRepository = require("../repository/postRepository");
var userRepository = require("../repository/userRepository");
var processEvent = (io) =>{
    io.of("/bidchannel").on('connection',socket => {
        socket.on('init_channel',async () =>{

            if (socket.request.session.passport == null) {
                return
            }

            let userId = socket.request.session.passport.user;
            let privateChannel = userId+"_private";
            socket.join(privateChannel);
            console.log('userId: '+userId);
        });

        socket.on('caculator_money',totalDistance =>{
            let totalMoney = parseFloat(totalDistance) * 4000;
            console.log("total money : "+totalMoney);
            socket.emit('total_money',totalMoney);
        });

        socket.on("bid_post", async post =>{

            if (socket.request.session.passport == null) {
                return
            }
            if (post.awaittime > 30){
                socket.emit('error_post',{'message':'No more than 30 minutes'});
            }else {
                let userId = socket.request.session.passport.user;
                let userCurrent = await userRepository.findById(userId);
                let currentTime = new Date();
                let parseTime = post.awaittime * 60 * 1000;
                let expiredTime = new Date(currentTime.getTime() + parseTime);
                let newPost = new Post({
                    userId: userId,
                    totalDistance: post.totalDistance,
                    location: post.origin,
                    destination: post.destination,
                    status: post.desciption,
                    init_money: post.money,
                    expiredTime: expiredTime
                });

                newPost = await postRepository.addPost(newPost);
                socket.emit('newPost', {'newPost': newPost, 'user': userCurrent});
                //socket.broadcast.emit('driverIndexNewPost',newPost);
            }
        });

        socket.on('change_status_post', async data =>{
           let postId = data.postId;
           let postStore = await postRepository.findById(postId);
           if (!postStore){
               socket.emit('error_change_status',{message: 'Post already exist'});
           } else{
               let currentTime = Date.now();
               let expiredTime = new Date(postStore.expiredTime);
               if (expiredTime - currentTime < 0){
                   socket.emit('error_change_status',{message: 'Post expired time'});
                   return;
               }
               await postRepository.updateStatus({'id':data.postId,'status':data.newStatus});
               socket.emit("success_change_status",data);
           }
        });

        socket.on('adjourn_post',async data =>{
            let postId = data.postId;
            let postStore = await postRepository.findById(postId);
            if (!postStore){
                socket.emit('error_change_status',{message: 'Post already exist'});
                console.log('Lỗi rồi');
                return;
            } else {
                let expiredTime;
                let isHidden = false;
                if (data.value > 0)
                {
                    let currentTime = new Date();
                    let parseTime = data.value * 60 * 1000;
                    expiredTime = new Date(currentTime.getTime() + parseTime);
                    await postRepository.updateExpiredTime({'postId':data.postId,'expiredTime':expiredTime});
                }else{
                    expiredTime = postStore.expiredTime;
                    isHidden = true;
                }
                console.log({'postId':data.postId,'expiredTime':expiredTime,'isHidden':isHidden});
                socket.emit('success_adjourn',{'postId':data.postId,'expiredTime':expiredTime,'isHidden':isHidden});
            }
        });
    });
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