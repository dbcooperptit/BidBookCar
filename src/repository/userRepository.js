var User = require('../models/user');

var UserRepository = {};

UserRepository.find = async (data) =>{
    try {
        let dataStore = await User.find(data);
        console.log('Find user success');
        return dataStore;
    }catch (e) {
        throw e;
    }
};

UserRepository.findById = async (data) =>{
    try {
        let dataStore = await User.findById(data);
        console.log('Find user by id success');
        return dataStore;
    }catch (e) {
        throw e;
    }
};

UserRepository.findOne = async (data) =>{
    try {
        let dataStore = await User.findOne(data);
        console.log("Find one user success");
        return dataStore;
    }catch (e) {
        throw e;
    }
};

UserRepository.findAll = async () =>{
    try {
        return await User.find();
    }catch (e) {
        throw  e;
    }
}
module.exports = UserRepository;