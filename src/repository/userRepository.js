var User = require('../models/user');

var UserRepository = {};

/*
* Thêm mới người dùng
* data: dữ liệu thêm mới*/
UserRepository.addUser =async (data) =>{
    try {
        let newUser = new User(data);
        await newUser.save({_id:false});
        console.log('Create new user success');
    }catch (e) {
        throw e;
    }
}

// Tìm kiếm người dùng theo điều kiện
// data: dữ liệu người dùng
UserRepository.find = async (data) =>{
    try {
        let dataStore = await User.find(data);
        console.log('Find user success');
        return dataStore;
    }catch (e) {
        throw e;
    }
};

/*
* Tìm kiếm người dùng theo id
* id: Id người dùng*/
UserRepository.findById = async (id) =>{
    try {
        let dataStore = await User.findById(id);
        console.log('Find user by id success');
        return dataStore;
    }catch (e) {
        throw e;
    }
};
/*
* Tìm kiếm người dùng duy nhất theo điều kiện đầu vào
* data: điều kiện tìm kiếm ex: {'email':'sangnguyen@asd','fullName':'Sang Nguyen'}*/
UserRepository.findOne = async (data) =>{
    try {
        let dataStore = await User.findOne(data);
        console.log("Find one user success");
        return dataStore;
    }catch (e) {
        throw e;
    }
};

//Tìm kiếm tất cả người dùng.
UserRepository.findAll = async () =>{
    try {
        return await User.find();
    }catch (e) {
        throw  e;
    }
};

/*Tìm kiếm người dùng theo id và update
* data: Dữ liệu người dùng*/
UserRepository.findByIdAndUpdate = async (data) =>{
  try {
      let userStore = await User.findById(data._id);
      if (!userStore){
          console.log('Can not find user in database');
          return null;
      }
      await User.update({'_id': data._id},{
          $set:{
              'fullName': data.fullName,
              'email': data.email,
              'picture': data.picture,
              'phone': data.phone,
              'isActive': data.isActive,
              'socialId': data.socialId,
              'password': data.password
          }
      },{new : true});
      console.log('Update user success');
  }  catch (e) {
      throw e;
  }
};
module.exports = UserRepository;