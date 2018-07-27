var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login/checkmember', { title: 'Express' });
});
router.get('/login/customer', function(req, res, next) {
    res.render('login/signin', { title: 'Express' });
});
router.get('/login/driver', function(req, res, next) {
    res.render('login/signin', { title: 'Express' });
});

router.get('/register/customer', function(req, res, next) {
    res.render('login/signup', { title: 'Express' });
});
router.get('/register/driver', function(req, res, next) {
    res.render('login/signup', { title: 'Express' });
});
module.exports = router;
