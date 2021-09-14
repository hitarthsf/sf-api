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
createdAt: { type : Date, default: new Date()  },
updatedAt: {  type : Date,  default: new Date()},
});

// pre saving user
user.pre('save', function(next) {
    const currentUser = this;

    // only hash the password if it has been modified (or is new)
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function(error, salt) {
            // handle error
            if (error) return next(error);

            // hash the password using our new salt
            bcrypt.hash(currentUser.password, salt, function(error, hash) {
                // handle error
                if (error) return next(error);

                // override the cleartext password with the hashed one
                currentUser.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// compare password
user.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const UsersData = mongoose.model('user', user);

export default UsersData;
