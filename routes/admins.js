var express = require('express');
var router = express.Router();
var adminController = require('../src/controller/adminController.js');
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


module.exports = router;
