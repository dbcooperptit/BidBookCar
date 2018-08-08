var express = require('express');
var router = express.Router();
var authorController = require('../src/controller/authorizationController.js');
var driverController = require("../src/controller/driverController.js");
/* GET users listing. */
router.get('/',authorController.isAuthenticated,authorController.roleAuthorization(['driver']),driverController.index);
router.get('/top',authorController.isAuthenticated,authorController.roleAuthorization(['driver']),driverController.topDriver);
module.exports = router;
