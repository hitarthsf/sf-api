import passportJWT from 'passport-jwt';
import UsersData from '../models/UsersData.js';
import passport from 'passport';

// passport & jwt config
const {
    Strategy: JWTStrategy,
    ExtractJwt: ExtractJWT,
} = passportJWT;

// import User model
const User = UsersData;

// define passport jwt strategy
const opts = {};
console.log("here 1", process.env.JWT_SCHEME);
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme("jwt");
console.log({
    a: opts.jwtFromRequest
})
opts.secretOrKey = "sSfFaApPiI112233";
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
