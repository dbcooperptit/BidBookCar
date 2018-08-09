var express = require('express');
var router = express.Router();
var loginController = require('../src/controller/loginController');
var authController =require('../src/controller/authorizationController');
var auth = require('../src/auth');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login/checkmember', { title: 'Home' });
});
router.get('/login', function(req, res, next) {
    if(req.isAuthenticated()){
        let url = authController.getUrlByRoles(req,res);
        if (url==="/users") {
            res.redirect(url + '/profiles');
        }else{
            res.redirect(url);
        }
    }else {

        res.render('login/signin', {
            success: req.flash('success')[0],
            errors: req.flash('error'),
            title: 'Welcome to Bid CAR'
        });
    }
});

router.get('/register/customer', function(req, res, next) {

    res.render('login/signup', {
        errors: req.flash('error'),
        title: 'Signup with User',
        signupWith: 'user'
    });
});

router.get('/register/driver', function(req, res, next) {
    res.render('login/signup', {
        errors: req.flash('error'),
        title: 'Singup wiht Drivers',
        signupWith: 'driver'
    });
});

router.post('/doLogin', passport.authenticate('local-login', {
    failureRedirect: '/login',
    failureFlash: true
}),(req, res) =>{
    let url = authController.getUrlByRoles(req,res);
    console.log(url);
    if (url==="/users") {
        res.redirect(url + '/profiles');
    }else{
        res.redirect(url);
    }
});

router.get('/logout',(req,res,next)=>{
    req.logout();
    res.redirect("/");
});

router.post('/doRegister',loginController.doRegister);

module.exports = router;
