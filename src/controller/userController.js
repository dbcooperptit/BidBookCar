var userRepository = require("../repository/userRepository");

var UserController = {};

UserController.getProfile = async(req, res) =>{
  res.render("profile");
};

module.exports = UserController;