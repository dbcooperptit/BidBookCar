var userRepository = require('../repository/userRepository');

var LoginController ={};

LoginController.doRegister = async (req, res, next) =>{

    let signupWith = req.body.signupWith;
    let fullName = req.body.fullName;
    let email = req.body.email;
    let password = req.body.password;
    console.log("full name: "+fullName);
    if(fullName === '' || password === '' || email === ''){
        req.flash('error', 'Missing credentials');
        if (signupWith==='user'){
            res.redirect('/register/customer');
        } else{
            res.redirect('/register/driver');
        }
    }else{
        let userStore = await userRepository.findOne({'email': new RegExp('^' + email + '$', 'i'), 'socialId': null});
        if (userStore){
            req.flash('error', 'Email already exist');
            if (signupWith==='user'){
                res.redirect('/register/customer');
            } else{
                res.redirect('/register/driver');
            }
        }else{
            switch(signupWith){
                case 'user':
                    await userRepository.addUser({email:email,password:password,fullName:fullName,isActive:true});

                    req.flash('success', 'Your account has been created. Please log in.');
                    res.redirect('/login');
                    break;
                case 'driver':
                    let phone = req.body.phone;
                    await userRepository.addUser({email:email,password:password,fullName:fullName,isActive:false,phone:phone});

                    req.flash('success', 'Your account has been created. Please log in.');
                    res.redirect('/login');
                    break;

            }
        }
    }
};
module.exports = LoginController;