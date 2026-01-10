const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const WrapAsync = require("../utils/wrapAsyc.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");


//signup
router
.route("/signup")
.get( userController.renderSignupForm)
.post(WrapAsync(userController.signup)
);


//login
router
.route("/login")
.get(userController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  WrapAsync(userController.login)
);



//logout

router.get("/logout", userController.logout);

module.exports = router;
