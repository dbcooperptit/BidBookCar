var userRepository = require("../repository/userRepository");
var postRepository = require("../repository/postRepository");
var Order = require("../models/order");
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
    dataValid.forEach(x => x.bid.sort((a, b) => {
        if (a.price > b.price) return -1;
        if (a.price < b.price) return -1;
        return 0;
    }));

    let allOrderRaw = await Order.find({ 'userId': userId });
    var allOrder = allOrderRaw.map(async x => {
        let customerName = (await userRepository.findById(x.userId)).fullName;
        let driverName = (await userRepository.findById(x.driverId)).fullName;
        return {
            'orderId': x._id,
            'customerName': customerName,
            'driverName': driverName,
            'location': x.location,
            'destination': x.destination,
            'price': x.price,
            'createAt': x.createAt
        }
    });

    //console.log(dataValid);
    await Promise.all(allOrder).then(item => {
        res.render("profiles/index", { post: dataValid, newPostValid: newPostValid, user: req.user, listOrder: item });
    });

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

UserController.orderDetail = async (req,res,next) =>{
    try {
        let orderId = req.query.orderId;
        let orderDetailRaw = await Order.findById(orderId);
        let customer = (await userRepository.findById(orderDetailRaw.userId));
        let driver = (await userRepository.findById(orderDetailRaw.driverId));
        let dataRes ={
            'orderId': orderId,
            'customerName': customer.fullName,
            'customerPicture':customer.picture,
            'customerPhone':customer.phone,

            'driverName': driver.fullName,
            'driverPicture':driver.picture,
            'driverPhone':driver.phone,

            'location': orderDetailRaw.location,
            'destination': orderDetailRaw.destination,
            'price': orderDetailRaw.price,
            'createAt': orderDetailRaw.createAt
        };
        res.send(dataRes);
    }catch (e) {
        throw e;
    }
};
module.exports = UserController;