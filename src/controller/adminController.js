var User = require("../models/user.js");

//show list all Customer
exports.all_user = function(req, res, next){  
	User.find({role:'user'},function(err,dulieu){
		res.render('admins/customer', { title: 'Manager Customer', data:dulieu});
	}); 
};


//Active Customer
exports.active_user = async (req, res, next) => {  

	var id = req.body.id;
	var active= req.body.active;

	try {
		await User.findOneAndUpdate({'_id':id},{
			$set:{
				isActive: active
			}
		});
		res.send({status:'OK'});
	} catch(e) {
		// statements
		console.log(e);
	}
};

//show list all Driver
exports.all_driver = function(req, res, next){  
	User.find({role:'driver'},function(err,dulieu){
		res.render('admins/driver', { title: 'Manager Driver', data:dulieu});
	}); 
};


//Active Driver
exports.active_driver = async (req, res, next) => {  

	var id = req.body.id;
	var active= req.body.active;

	try {
		await User.findOneAndUpdate({'_id':id},{
			$set:{
				isActive: active
			}
		});
		res.send({status:'OK'});
	} catch(e) {
		// statements
		console.log(e);
	}
};
