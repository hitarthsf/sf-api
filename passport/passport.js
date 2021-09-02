import passportJWT from 'passport-jwt';
import UsersData from '../models/UsersData.js';
import dotenv from 'dotenv';
dotenv.config();

// passport & jwt config
const {
    Strategy: JWTStrategy,
    ExtractJwt: ExtractJWT,
} = passportJWT;

// import User model
const User = UsersData;

// define passport jwt strategy
const opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.JWT_SECRET_OR_KEY;
const passportJWTStrategy = new JWTStrategy(opts, function(jwtPayload, done) {
    // retreive mail from jwt payload
    console.log({
        jwtPayload
    })
    const email = jwtPayload.email;
    User.findOne({email: email}, (error, user) => {
        if (error) {
            return done(error, false);
        } else {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        }
    });
});

// export default passport.use(passportJWTStrategy);

// config passport
export default function(passport) {
    // token strategy
    passport.use(passportJWTStrategy);

    // return configured passport
    return passport;
};
