import mongoose from 'mongoose';

const user = mongoose.Schema({
name:String,
email:String, 
phone:String,
image:Array,
email_verified_at:String,
password:String,
remember_token:String,
type:String,
is_active:String,allow_email:String,is_show:String,source_of_creation:String,allow_complain_mails:String,
createdAt: { type : Date, default: new Date()  },
updatedAt: {  type : Date,  default: new Date()}, 
});

const UsersData = mongoose.model('user', user);

export default UsersData;