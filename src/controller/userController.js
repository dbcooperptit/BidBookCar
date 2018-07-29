var userRepository = require("../repository/userRepository");
var postRepository = require("../repository/postRepository");
var UserController = {};

UserController.getProfile = async (req, res) => {
    let userId = req.user._id;
    let newPostValid = true;
    let dataStore = await postRepository.findByPredicate({'userId': userId});
    let currentTime = Date.now();
    let dataValid = dataStore.filter(x => {
        let timePost = new Date(x.expiredTime);
        return timePost - currentTime > 0;
    });
    if (dataValid.length > 0) {
        newPostValid = false;
    }
    console.log(dataValid);
    res.render("profiles/index", {post: dataValid, newPostValid: newPostValid,user: req.user});
};

module.exports = UserController;