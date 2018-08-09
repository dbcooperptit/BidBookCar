var express = require('express');
var router = express.Router();
var adminController = require('../src/controller/adminController.js');
var authController = require("../src/controller/authorizationController.js")
/* GET users listing. */
router.get('/',authController.isAuthenticated,authController.roleAuthorization(['admin']), function(req, res, next) {
    res.render('admins/dashboard', { title: 'Dashboard' });
});

//customer
router.get('/customer',authController.isAuthenticated,authController.roleAuthorization(['admin']), adminController.all_user);


//active customer
router.post('/activeCustomerAjax',authController.isAuthenticated,authController.roleAuthorization(['admin']), adminController.active_user);

//Driver
router.get('/driver',authController.isAuthenticated,authController.roleAuthorization(['admin']), adminController.all_driver);


//active Driver
router.post('/activeDriverAjax',authController.isAuthenticated,authController.roleAuthorization(['admin']), adminController.active_driver);

//Order
router.get('/order',authController.isAuthenticated,authController.roleAuthorization(['admin']), adminController.all_order);

//Delete Order
router.get('/deleteOrder/:idcanxoa',authController.isAuthenticated,authController.roleAuthorization(['admin']), adminController.delete_order);


module.exports = router;
