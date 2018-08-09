var express = require('express');
var router = express.Router();
var adminController = require('../src/controller/adminController.js');
var authController = require("../src/controller/authorizationController.js")
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admins/dashboard', { title: 'Dashboard' });
});

//customer
router.get('/customer', adminController.all_user);


//active customer
router.post('/activeCustomerAjax', adminController.active_user);

//Driver
router.get('/driver', adminController.all_driver);


//active Driver
router.post('/activeDriverAjax', adminController.active_driver);

//Order
router.get('/order', adminController.all_order);

//Delete Order
router.get('/deleteOrder/:idcanxoa', adminController.delete_order);


module.exports = router;
