var Post = require('../models/post');
var User = require('../models/user');
var PostRepository ={};

PostRepository.findAll = async()=>{
    try {
        let dataStore = await Post.find();
        return dataStore;
    }  catch (e) {
        console.log("find all post error "+e.message);
        throw e;
    }
};

PostRepository.findByPredicate = async (data) =>{
  try {
      let dataStore = await Post.find(data);
      return dataStore;
  }  catch (e) {
      throw e;
  }
};

PostRepository.findById = async (id) =>{
    try {
        let dataStore = await Post.findById(id);
        console.log("find Post by id success");
        return dataStore
    }catch (e) {
        console.log('find post by id error '+e.message);
        throw e;
    }
};

PostRepository.findOne = async (data) =>{
    try {
        let dataStore = await Post.findOne(data);
        console.log('find one success');
        return dataStore;
    }catch (e) {
        console.log('find one err '+e.message);
        throw e;
    }
};

PostRepository.addPost = async (data) =>{
    try {
        let newPost = new Post(data);
        await newPost.save({_id:false});
        console.log('save post success')
        return newPost;
    }catch (e) {
        console.log('add post error '+e.message);
        throw e;
    }
};

PostRepository.updateExpiredTime = async (data) => {
  try {
      await Post.update({'_id':data.id},{
          $set:{
              expiredTime: data.expiredTime
          }
      });
      console.log('update status post success');
  }  catch (e) {
      console.log('update err');
      throw e;
  }
};

PostRepository.updateStatus = async (data) => {
    try {
        await Post.update({'_id':data.id},{
            $set:{
                status: data.status
            }
        });
        console.log('update status post success');
    }  catch (e) {
        console.log('update err');
        throw e;
    }
};

PostRepository.updateOrCreateBid = async (data) =>{
  try {
    let dataStore = await Post.findById(data.id);
    if (!dataStore){
        console.log('update bid error');
        return;
    } else{
        let driversInStore = await Post.findOne({'_id':dataStore._id,'bid.driverId': data.driverId});
        let driver = await User.findById(data.driverId);
        if (driversInStore){
            console.log('driver is valid');
            await Post.update({'_id':dataStore._id,'bid.driverId':data.driverId},{
                $set:{
                    'bid.$.price':data.price,
                    'bid.$.awaitTime':data.awaitTime
                }
            });
            console.log('update bid success');
            return;
        }
        console.log('driver not valid. dataStore Id: '+dataStore._id);
        let newBid = {
            driverId: data.driverId,
            awaitTime: data.awaitTime,
            price: data.price,
            fullName: driver.fullName
        };
        await Post.update({'_id':dataStore._id},{
            $push:{
                'bid': newBid
            }
        });
        console.log('update bid success');
    }
  } catch (e) {
    throw e;
  }
};

PostRepository.removePost = async(id) =>{
    try {
        await PostRepository.remove({'_id':id});
    }catch (e) {
        console.log('remove post error '+e.message);
    }
};

module.exports = PostRepository;

