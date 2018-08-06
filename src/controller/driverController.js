var DriverController={}

DriverController.index = async(req,res,next) =>{
  res.render('drivers/index');
};

module.exports = DriverController;