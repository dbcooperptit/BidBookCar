var User  = require('../models/user');
var AuthorizationController = {};

AuthorizationController.roleAuthorization = roles =>{
    return function(req, res, next){

        let user = req.user;
        console.log("user: "+user);

        User.findById(user._id, function(err, foundUser){

            if(err){
                res.render('err',{messages:err.messages});
                return next(err);
            }

            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }

            res.render('error');
            return next('Unauthorized');
        });

    }
};

AuthorizationController.getUrlByRoles = (req, res) =>{
    let user = req.user;
    switch (user.role){
        case 'admin':
            return '/admins';
        case 'user':
            return '/users';
        case 'driver':
            return '/drivers';
    }
};
AuthorizationController.isAuthenticated = (req, res, next) =>{
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/');
    }
};
module.exports = AuthorizationController;