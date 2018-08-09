var express = require('express');
var router = express.Router();
var authController = require('../src/controller/authorizationController');
var userController = require('../src/controller/userController')
/* GET users listing. */
router.get('/profiles',authController.isAuthenticated,authController.roleAuthorization(['user']), userController.getProfile);

router.post('/doUpdateUser',authController.isAuthenticated,authController.roleAuthorization(['user']),userController.doUpdateUser);

router.get('/orderDetail',authController.isAuthenticated,authController.roleAuthorization(['user']),userController.orderDetail);
module.exports = router;
