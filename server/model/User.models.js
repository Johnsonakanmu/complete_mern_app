const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
 username: {
    type: String,
    required: true,
    unique: [true, "Username Exist"]
 },
 password: {
    type: String,
    required: true,
    unique: [true, "Please provide a password"]
 },
 email: {
    type: String,
    required: true,
    unique: [true, "Please provide a unique email"]
 },
 firstName: {type: String },
 lastName: { type: String },
 mobile: {type: Number },
 address: { type: String },
 profile: {type: String },
});


module.exports = mongoose.model('User', UserSchema)