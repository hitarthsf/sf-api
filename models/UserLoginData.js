import mongoose from "mongoose";

const userLogin = mongoose.Schema({
    user_id: mongoose.Schema.ObjectId,
    createdAt: { type : Date, default: new Date()  },
    updatedAt: {  type : Date,  default: new Date()},
    old_user_login_id: String,
});
const UserLoginData = mongoose.model('user_login', userLogin);

export default UserLoginData;

