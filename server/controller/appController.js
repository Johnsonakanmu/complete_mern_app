const User = require("../model/User.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator')

module.exports = {
  verifyUser: async (req, res, next) => {
    try {
      const username =
        req.method === "GET" ? req.query.username : req.body.username;

      // Check if the user exists
      const existingUser = await User.findOne({ username });

      if (!existingUser) {
        return res.status(404).send({ error: "Can't find username" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Authentication Error" });
    }
  },

  /** Post : http://localhost: 8080/api/register
   *  @param: {
   *  "username": "example1234",
   * "password": johnson123",
   * "email": "example1234@example.com,
   * "firstName": "Johns",
   * "lastName":  "Akanmuu",
   * "phoneNumber": 09089787878,
   * "address": "No.10 somorin street",
   * "profile": ""
   * }
   */

  register: async (req, res) => {
    try {
      const { username, password, profile, email } = req.body;

      // Check if the username or email already exists
      const [existingUsername, existingEmail] = await Promise.all([
        User.findOne({ username }),
        User.findOne({ email }),
      ]);

      if (existingUsername) {
        return res.status(400).send({ error: "Please use a unique username" });
      }

      if (existingEmail) {
        return res.status(400).send({ error: "Please use a unique email" });
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
          username,
          password: hashedPassword,
          profile: profile || "",
          email,
        });

        const savedUser = await user.save();

        return res.status(201).send({ msg: "User registered successfully" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Something went wrong" });
    }
  },

  /**  Post : http://localhost: 8080/api/login 
     *  @param: {
      "username": "example1234",
      "password": johnson123",
    }
     */
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).send({ error: "Username or Password does not match" });
      }

      const passwordCheck = await bcrypt.compare(password, user.password);

      if (!passwordCheck) {
        return res.status(400).send({ error: "Password or Username does not match" });
      }

      // Create JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).send({
        msg: "Login Successful...!",
        username: user.username,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  },

  /** Get: http://localhost:8080/api/user/example123 */
  getUser: async (req, res) => {
    const { username } = req.params;

    try {
      if (!username) {
        return res.status(501).send({ error: "Invalid username" });
      }

      const user = await User.findOne({ username });

      if (!user) {
        return res.status(501).send({ error: "User not found" });
      }

      // If you don't wan t to return the 'password' field in the response, exclude it here
      const { password, ...userData } = user.toObject(); // Convert to a plain JavaScript object
      // OR: const { password, ...userData } = user.toJSON();

      return res.status(200).send(userData);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to retrieve user data" });
    }
  },

  /** PUT: http://localhost:8080/api/updateuser 
     * @ param: {
     * "id": "<userId>"
       }
     body: {
     firstName: "", address: "", profile: "",
     }
    */
  updateUser: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).send({ error: "Invalid user ID" });
      }

      const updateData = req.body;

      // Update the data
      const result = await User.updateOne({ _id: userId }, updateData);

      if (result.nModified === 0) {
        return res
          .status(404)
          .send({ error: "User not found or no changes were made" });
      }

      return res.status(200).send({ msg: "Record Updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to update user data" });
    }
  },

  /**GET: http://localhost:8080/api/generateOTP */
  generateOTP: async (req, res) => {
    req.app.locals.OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    res.status(201).send({ code: req.app.locals.OTP });
  },

  /**GET: http://localhost:8080/api/verifyOTP */
  verifyOTP: async (req, res) => {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
      req.app.locals.OTP = null; //reset the OTP value
      req.app.locals.resetSession = true; // start session for reset password
      return res.status(201).send({ msg: "Verify Successfully..!" });
    }
    return res.status(400).send({ error: "Invalid OTP" });
  },

  // Successfully redirect user when OTP is valid
  /**GET: http://localhost:8080/api/createResetSession */
  createResetSession: async (req, res) => {
    if (req.app.locals.resetSession) {
      req.app.locals.resetSession = false; //allow access to this route only once
      return res.status(201).send({ msg: "access granted...!" }); 
    }
    return res.status(440).send({ error: "Session expired" });
  },

  // Update the password when we have valid session
  /**PUT: http://localhost:8080/api/resetPassword */
  resetPassword: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!req.app.locals.resetSession) {
        return res.status(440).send({ error: "Session expired" });
      }

      // Check if the token matches the stored token in the database
      const user = await User.findOne({ username });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password
      await User.findOneAndUpdate({ username }, { password: hashedPassword });
      req.app.locals.resetSession = false;
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  
  },

};
