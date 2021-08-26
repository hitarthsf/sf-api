import passport from 'passport';
let passportProxy = await import('../passport/passport.js');
console.log({
    passportProxy
})
export default passportProxy.default(passport);
