import passport from 'passport';
let passportProxy = await import('../passport/passport.js');
export default passportProxy.default(passport);
