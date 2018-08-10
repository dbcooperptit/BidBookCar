var config 	= require('../config');
var redis 	= require('redis').createClient;
var storeRedis = require('redis');
var adapter = require('socket.io-redis');
var Post = require("../models/post");
var postRepository = require("../repository/postRepository");
var userRepository = require("../repository/userRepository");
var confirmData = require('../models/confirmtemp');
var orderRepository = require('../repository/orderRepository');
//driver activity
// 0: đang rảnh.
// 1: đang bận.
let client = '';
let redis_key = config.redis_key.key_1;

var userTimeOut = [];

var processEvent = (io) =>{
    io.of("/bidchannel").on('connection',socket => {
        socket.on('init_channel',async () =>{

            if (socket.request.session.passport == null) {
                return
            }

            let userId = socket.request.session.passport.user;
            let userStore = await userRepository.findById(userId);
            let privateChannel = userId+"_private";
            socket.join(privateChannel);

            if (userStore.role === 'driver'){
                let driverStatus = {
                    driverId: userId,
                    status:0
                };
                console.log(userTimeOut);
                let existDriverId = false;
                userTimeOut.forEach(x=>{
                   if (x.driverId === userId){
                       existDriverId=true;
                   }
                });
                if (!existDriverId) {
                    console.log("Init: not include");
                    client.srem(redis_key, JSON.stringify({
                        driverId: userId,
                        status: 1
                    }));
                    client.sadd(redis_key, JSON.stringify(driverStatus));
                }
            }

            console.log('userId: '+userId);
            socket.emit('reload_driver_activity',{message: 'connection'});
            socket.broadcast.emit('reload_driver_activity',{message: 'connection'});
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
                socket.broadcast.emit('driverIndexNewPost',{'newPost': newPost, 'user': userCurrent});
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
               socket.broadcast.emit('status_to_driver',data);
           }
        });

        socket.on('adjourn_post',async data =>{
            let postId = data.postId;
            let userId = socket.request.session.passport.user;
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
                socket.emit('success_adjourn',{'postId':data.postId,'expiredTime':expiredTime,'isHidden':isHidden});
                socket.broadcast.emit('adjourn_to_drivers',{'postId':data.postId,'expiredTime':expiredTime,'isHidden':isHidden})

                if (isHidden){
                    let filterDriver =await findDriver(postId);
                    client.smembers(redis_key,async (err,replies) =>{
                        if (err) throw err;
                        var dataStore = replies.map(x=> JSON.parse(x));

                        let driverInvalid =  filterDriver.filter(x=> {
                            let k =  false;
                            dataStore.forEach(ds=> {
                                k = ds.id===x.id && ds.status===0;
                            });
                            return k;
                        }).sort((a,b)=>{ return a.price-b.price; });

                        if (driverInvalid.length <1){
                            return;
                        }

                        let chooseDriver = driverInvalid[0];
                        let driverInfo = await userRepository.findById(chooseDriver.driverId);
                        let postInfo = await postRepository.findById(postId);
                        socket.broadcast.to(chooseDriver.driverId+"_private").emit('chooseUserToDriver',{'postInfo':postInfo,'userId':userId,"bestPirceChoose":chooseDriver.price});
                        socket.emit('chooseDriversToUser',{'postId':postId,'driverInfo':driverInfo,"bestPirceChoose":chooseDriver.price});
                    });
                }
            }
        });

        socket.on('driverBid',async data =>{
            console.log('Update bid: ' + data.postId + data.bid + data.arrivalTime);
            try {
                if (!data.postId || !data.bid || !data.arrivalTime) {
                    console.log('Input not null');
                    socket.emit('driverIndexError', {message: 'Input not null'});
                } else {
                    if (!socket.request.session.passport) {
                        return;
                    }
                    let userId = socket.request.session.passport.user;
                    let curentTime = new Date();
                    let arrivalTime = new Date(curentTime.getTime() + data.arrivalTime*60*1000);
                    let newData = {
                        id: data.postId,
                        driverId: userId,
                        price: data.bid,
                        awaitTime: arrivalTime
                    };

                    await postRepository.updateOrCreateBid(newData);

                    let posts = await postRepository.findById(data.postId);
                    let bidColl = posts.bid.sort(sortBID);
                    socket.emit('driverIndexSuccess',{message:'BID success',postId: data.postId, bestPrice: bidColl[0].price});
                    socket.broadcast.to(posts.userId+"_private").emit('driverBidToUser',{ 'allBid': bidColl});
                }
            } catch(e){
                socket.emit('driverIndexError', {message: e.message});
            }
        });

        socket.on('userConfirm',async data =>{
            if ( !socket.request.session.passport){
                return;
            }
            let userId = socket.request.session.passport.user;
            let bestPirceChoose = data.bestPirceChoose;
            let postId = data.postId;
            let driverId = data.driverId;

            let dataInvalid = await confirmData.findOne({'driverId':driverId,'postId':postId});
            console.log('userConfirm Data Confirm Store: '+dataInvalid);
            //Nếu dữ liệu chưa tồn tại
            if (!dataInvalid){
                console.log('Data Confirm Store: false');
                let confirm = new confirmData({
                    postId:postId,
                    userId:userId
                });
                await confirm.save({_id:false});
                let confirmId = confirm._id;
                updateDriverActivity(1,driverId);
                await startDeal(socket, confirmId, driverId, postId, bestPirceChoose, driverId);
            } else{
                console.log('userConfirm data found, start update');
                await confirmData.update({'_id':dataInvalid._id},{
                    $set:{
                        userId: userId
                    }
                });
                return;
            }
        });

        socket.on('driverConfirm',async data=>{
            if ( !socket.request.session.passport){
                return;
            }
            let driverId = socket.request.session.passport.user;
            let bestPirceChoose = data.bestPirceChoose;
            let postId = data.postId;
            let userId = data.userId;

            let dataInvalid = await confirmData.findOne({'userId':userId,'postId':postId});

            //Nếu dữ liệu chưa tồn tại
            if (!dataInvalid){
                console.log('driverConfirm data not found');
                let confirm = new confirmData({
                    postId:postId,
                    driverId: driverId
                });
                await confirm.save({_id:false});
                updateDriverActivity(1,driverId);
                let confirmId = confirm._id;
                await startDeal(socket, confirmId, userId, postId, bestPirceChoose, driverId);
            } else{
                console.log('driverConfirm data found, start update');
                await confirmData.update({'_id':dataInvalid._id},{
                    $set:{
                        driverId: driverId
                    }
                });
                return;
            }
        });

        socket.on('decline_customer',async ()=>{
            if ( !socket.request.session.passport){
                return;
            }
            let userId = socket.request.session.passport.user;

            updateDriverActivity(0,userId);
            socket.emit('decline_customer_success',{message:'success'});
            console.log('decline_accepts');
        });

        //region customer choose driver

        socket.on('customer_choose_driver',async (driverId, postId) =>{
           if (!socket.request.session.passport){
               return;
           }
           let userId = socket.request.session.passport.user;
           client.smembers(redis_key,async (err,replies)=>{
               if (err) throw err;
               let driverActivity = replies.map(x=> JSON.parse(x));

               let driverFree = driverActivity.filter(x=>{
                   return x.driverId === driverId && x.status ===0;
               });

               console.log("Driver free"+driverFree);
               if (!driverFree){
                   socket.emit('driver_busy_to_user',{message:' The driver is busy. '});
               }else {
                   let postData = await postRepository.findById(postId);
                   let user = await userRepository.findById(userId);
                   socket.broadcast.to(driverId + "_private").emit('send_request_to_driver', {
                       'postInfo': postData,
                       'userInfo': user
                   });
                   updateDriverActivity(1, driverId);
               }
           })
        });

        socket.on('driver_send_report', async (userId, postId)=>{
            if (!socket.request.session.passport){
                return;
            }
            let driverId = socket.request.session.passport.user;
            updateDriverActivity(1,driverId);
            let postInfo = await postRepository.findById(postId);
            let price = 0;
            postInfo.bid.forEach(x=>{
                if ( x.driverId === driverId){
                    price = x.price;
                }
            });
            let order = {
                userId: postInfo.userId,
                driverId: driverId,
                location:postInfo.location,
                destination:postInfo.destination,
                price: price
            };
            let updatePost = {
                postId: postId,
                expiredTime: new Date()
            }
            let orderNew = await orderRepository.saveOrder(order);
            await postRepository.updateExpiredTime(updatePost);
            socket.emit('driver_report_success',{'orderNew':orderNew,'postId':postId});
            socket.broadcast.to(userId+"_private").emit('driver_report_success',{'orderNew':orderNew,'postId':postId});
            //let userTimeOut = global.userTimeOut;
            userTimeOut.push({
                driverId
            });
            //global.userTimeOut = userTimeOut;
            setTimeout(()=>{
                userTimeOut = userTimeOut.filter(x=>x.driverId !== driverId);
                updateDriverActivity(0,driverId);
            },120000);
        });

        socket.on('decline_from_driver',async (userId)=>{
            if ( !socket.request.session.passport){
                return;
            }
            let driverId = socket.request.session.passport.user;
            updateDriverActivity(0,driverId);
            socket.broadcast.to(userId+"_private").emit('driver_busy_to_user',{message:'The driver is busy'});
        });
        
        socket.on('disconnect',async()=>{
            if (!socket.request.session.passport){
                return;
            }
            let userId = socket.request.session.passport.user;
            let user = await userRepository.findById(userId);
            if (user.role === 'driver'){
                updateDriverActivity(1,userId);
            }
            socket.broadcast.emit('reload_driver_activity',{message: 'disconnect'});
        });

        // socket.on('reconnect',async()=>{
        //     if (!socket.request.session.passport){
        //         return;
        //     }
        //     let userId = socket.request.session.passport.user;
        //     let user = await userRepository.findById(userId);
        //     //let userTimeOut=global.userTimeOut;
        //     if (user.role === 'driver'){
        //         if (userTimeOut.includes(userId)) {
        //             return
        //         }else{
        //             updateDriverActivity(0, userId);
        //         }
        //     }
        // });
        //end region
    });
};
function startDeal(socket, confirmId, broadcastId, postId, bestPirceChoose, driverId) {
    return new Promise(resolve => {
        setTimeout(async () => {
            let confirmStore = await confirmData.findById(confirmId);
            if (!confirmStore.driverId || !confirmStore.userId){
                updateDriverActivity(0,driverId);
                socket.emit('deal_build_error',{message:'This user busy'});
                await confirmData.remove({'_id':confirmId});
                return;
            }
            let postStore = await postRepository.findById(postId);
            console.log("Confirm store"+confirmStore);
            let order = {
                userId: confirmStore.userId,
                driverId: confirmStore.driverId,
                location:postStore.location,
                destination:postStore.destination,
                price:bestPirceChoose
            };
            let orderDetail = await orderRepository.saveOrder(order);
            socket.emit('deal_build_success',{message: 'Giao dịch thành công'});
            socket.broadcast.to(broadcastId+"_private").emit('deal_build_success',{message: 'Giao dịch thành công'});

           // let userTimeOut = global.userTimeOut;
            userTimeOut.push({
                driverId
            });
            //global.userTimeOut = userTimeOut;

            setTimeout(()=>{
                userTimeOut = userTimeOut.filter(x=>x.driverId !== driverId);
               updateDriverActivity(0,confirmStore.driverId);
            },120000);
            //await confirmData.remove({'_id':confirmId});
        }, 20000);
    });
}

let sortBID = (a,b) =>{
    if (a.price < b.price) return -1;
    if (a.price > b.price) return 1;
    if (a.price === b.price){
        let c = new Date(a.expiredTime);
        let d = new Date(b.expiredTime);
        return c - d;
    }
};

let findDriver = async (postId) =>{
    let driverBid = await postRepository.findById(postId);

    let filterDriver = driverBid.bid.map(d => {
        return { 'driverId': d.driverId,'price': d.price};
    });
    return filterDriver;
    /*async myFunc() {
        const res = await getAsync('foo');
        console.log(res);
    }*/
};

let updateDriverActivity = (activity,driverId) =>{
  let dataOne = {
      driverId: driverId,
      status:0
  };
  let  dataTwo = {
        driverId: driverId,
        status:1
  };
    switch (activity){
        case 0:{
            client.srem(redis_key,JSON.stringify(dataTwo));
            client.sadd(redis_key,JSON.stringify(dataOne));
            break;
        }
        case 1:{
            client.srem(redis_key,JSON.stringify(dataOne));
            client.sadd(redis_key,JSON.stringify(dataTwo));
            break;
        }
    }
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

    client = storeRedis.createClient('redis://' + config.redis.user + ':' + config.redis.password + '@' + host + ':' + port);

    client.del(redis_key);

    processEvent(io);

    return server;
};
module.exports = init;