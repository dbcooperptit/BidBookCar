var userRepository = require("../repository/userRepository");
var postRepository = require("../repository/postRepository");
var bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 10;
var UserController = {};

UserController.getProfile = async (req, res) => {
    let userId = req.user._id;
    let newPostValid = true;
    let dataStore = await postRepository.findByPredicate({ 'userId': userId });
    let currentTime = Date.now();
    let dataValid = dataStore.filter(x => {
        let timePost = new Date(x.expiredTime);
        return timePost - currentTime > 0;
    });
    if (dataValid.length > 0) {
        newPostValid = false;
    }
    dataValid.forEach(x=>x.bid.sort((a,b)=>{
       if(a.price > b.price) return -1;
       if(a.price < b.price) return -1;
       return 0;
    }));
    //console.log(dataValid);
    res.render("profiles/index", { post: dataValid, newPostValid: newPostValid, user: req.user });
};
UserController.doUpdateUser = async (req, res, next) => {
    let email = req.body.email;
    console.log(email);
    let fullName = req.body.fullName;
    console.log(fullName);
    let password = req.body.password;
    console.log(password);
    let againPassword = req.body.againPassword;
    console.log(againPassword);
    if (fullName === '' || password === '' || email === '') {
        req.flash('error', 'Missing credentials');
    } else {
        if (password === againPassword) {
            let userStore = req.user;
            console.log(userStore._id);
            userStore.password = userStore.generateHasPassword(password);
            await userRepository.findByIdAndUpdate({ 'id': userStore._id, 'fullName': fullName, 'password': userStore.password });
            req.flash('success', 'Update Completed');
            res.redirect('/login');
        } else {
            req.flash('error', 'Missing credentials');
        }
    }
};
module.exports = UserController;