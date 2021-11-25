import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const user = mongoose.Schema({
    name:String,
    email:String,
    phone:String,
    image:Array,
    email_verified_at:String,
    password:String,
    remember_token:String,
    type:String,
    company_id: String,
    location_id:[String],
    is_active:String,allow_email:String,is_show:String,source_of_creation:String,allow_complain_mails:String,
    include_in_ratings: Number,
    gender:String,
    dob:String,
    address:String,
    facebook_id:String,
    google_id : String,
    android_device_id: String,
    ios_device_id :String,
    createdAt: { type : Date, default: new Date()  },
    updatedAt: {  type : Date,  default: new Date()},
    old_user_id: String,
});

const UserMigratedData = mongoose.model('updated_user', user);

export default UserMigratedData;
