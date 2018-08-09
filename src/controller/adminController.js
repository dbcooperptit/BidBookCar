var User = require("../models/user.js");
var Order = require("../models/order");
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

exports.all_order = async (req,res,next)=>{
	try {
		let allOrderRaw = await Order.find();
		let allOrder = allOrderRaw.map(async x=>{
			let customerName = (await User.findById(x.userId)).fullName;
			let driverName = (await User.findById(x.driverId)).fullName;
			return {
				'orderId':x._id,
				'customerName':customerName,
				'driverName': driverName,
				'location':x.location,
				'destination':x.destination,
				'price':x.price,
				'createAt':x.createAt
			}
		});
		await Promise.all(allOrder).then(item => res.render('',{'dataItem':item}));
    }catch (e) {
		throw e;
    }
}

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
