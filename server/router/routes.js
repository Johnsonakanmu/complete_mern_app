const express = require('express');
const router = express.Router();
const controller = require('../controller/appController');
const Auth = require('../middleware/auth');
const {registerMail}= require('../controller/mailer')
const { localVeriables } = require("../middleware/otp.locals");

//** Post Methods */
router.route('/register').post(controller.register); // register user
router.route('/registerMail').post(registerMail); // send the email
router.route('/authenticate').post((req, res) => res.end()); // authenticate user
router.route('/login').post(controller.verifyUser, controller.login); // login user

//** Get Methods */
router.route('/user/:username').get(controller.getUser); // get the username
router.route('/generateOTP').get(controller.verifyUser, localVeriables, controller.generateOTP); // generate the random OTP
router.route('/verifyOTP').get(controller.verifyUser,controller.verifyOTP); // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession); // reset all the variables

//** Put Methods */
router.route('/updateUser').put(Auth, controller.updateUser); // is used to update the user profile
router.route('/resetPassword').put(controller.verifyUser,controller.resetPassword); // use to reset password

module.exports = router;
