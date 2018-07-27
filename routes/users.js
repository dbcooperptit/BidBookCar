var express = require('express');
var router = express.Router();
var userController = require('../src/controller/userController')
/* GET users listing. */
router.get('/profiles', userController.getProfile);

module.exports = router;
