var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admin/dashboard', { title: 'Dashboard' });
});

//customer
router.get('/customer', function(req, res, next) {
    res.render('admin/customer', { title: 'Manager Customer' });
});

//driver
router.get('/driver', function(req, res, next) {
    res.render('admin/driver', { title: 'Manager Driver' });
});

module.exports = router;
