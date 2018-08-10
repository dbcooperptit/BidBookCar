var postRepository = require('../repository/postRepository');
var userRpeository  = require('../repository/userRepository');
var orderRepository = require('../repository/orderRepository');
var config 	= require('../config');
var DriverController={}

var redis = require('redis');

DriverController.index = async(req,res,next) =>{
  let allPostRaw = await postRepository.findAll();
  let currentTime = new Date();
  var userId = req.user._id;

  let allPost = allPostRaw.filter(x=> {
      let timePost = new Date(x.expiredTime);
      return timePost - currentTime > 0;
  }).sort(sortbyDate);
  let newData =[];
  let dataNewAsync = allPost.map(async (x) => {
      let currentDriverBid ={};
      let poster = await userRpeository.findById(x.userId);
      console.log('Poster :'+poster);
      let bestPrice = 0;
      x.bid.forEach(xb => {
        if (xb.price > bestPrice) bestPrice = xb.price;
        if (xb.driverId===userId){
          currentDriverBid = xb;
        }
      }) ;
      return {'post':x,'driverBid': currentDriverBid,'poster':poster,'bestPrice':bestPrice};
  });
  await Promise.all(dataNewAsync)
      .then((item) =>{
          res.render('drivers/index',{'dataIndex':item,'driver':req.user});
      });

};

DriverController.topDriver = async (req,res,next) =>{
    let client = redis.createClient('redis://' + config.redis.host + ':' + config.redis.port);

    let allOrder = await orderRepository.findAll();
    let driverId = allOrder
        .map(x=>x.driverId)
        .reduce((newData,x)=>{
            let flag =false;
            newData.forEach(nd=>{
                if(nd.driverId === x){
                    nd.total ++;
                    flag=true;
                }
            });
            if (!flag) newData.push({driverId: x, total:1});
            return newData;
        },[])
        .sort((a,b)=> b.total - a.total);

    let topDriver = driverId.map(async x =>{
        let driver = await userRpeository.findById(x.driverId);
        return {'driver':driver,'total':x.total};
    });

     Promise.all(topDriver).then(item =>{
        client.smembers('driver_activity_status',(err, replies)=>{
           if (err) throw err;
           let driverActivity = replies.map(x=>JSON.parse(x));
           let data = item.map(i=>{
              let active = 1;
              driverActivity.forEach(da=>{
                  if (da.driverId === i.driver._id){
                      active = da.status;
                  }
              });
              return {
                  'driver':i.driver,
                  'total':i.total,
                  'activity': active === 0 ? 'Online':'Offline'
              }
           });
           res.send(data);
        });
    });
};


var sortbyDate = (a, b) =>{
    var c = new Date(a.createAt);
    var d = new Date(b.createAt);
    return d - c;
}

module.exports = DriverController;