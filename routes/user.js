import express from 'express';
import {
    MesssageProvider,
    Messages,
} from '../core/index.js';
import AuthUtils from "../utils/AuthUtils.js";
import UserController from "../controllers/UserController.js";

const {
    Router,
} = express;

// import * as passport from '../passport/passport.js';

// router instance
// cast to our passport client
// import('../passport/passport.js')(passport);
// .then(d => console.log)
import { default as passport } from '../utils/passport.js';
// require('../passport/passport.js')(passport);
// import * as passportAuth from 'passport/passport.js';

// eslint-disable-next-line new-cap
const userRoutes = Router();

/**
 * Get users list route
 */
userRoutes.get('/user-list',
    passport.authenticate(process.env.JWT_SCHEME, {session: false}), (request, response) => {
        const token = AuthUtils.retrieveToken(request.headers);
        if (AuthUtils.isValidToken(token)) {
            // valid token
            UserController.find(request, response);
        } else {
            // invalid token
            response
                .status(401)
                .send({
                    success: false,
                    message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
                });
        }
    });

/**
 * Add new user route
 */
userRoutes.post('/user-add',
    passport.authenticate(process.env.JWT_SCHEME, {session: false}), (request, response) => {
        const token = AuthUtils.retrieveToken(request.headers);
        if (AuthUtils.isValidToken(token)) {
            // valid token
            UserController.addIfNotExist(request, response);
        } else {
            // invalid token
            response
                .status(401)
                .send({
                    success: false,
                    message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
                });
        }
    });

/**
 * Update a user if exist route
 */
userRoutes.post('/user-update',
    passport.authenticate(process.env.JWT_SCHEME, {session: false}), (request, response) => {
        UserController.updateIfExist(request, response);
        const token = AuthUtils.retrieveToken(request.headers);
        if (AuthUtils.isValidToken(token)) {
            // valid token
            UserController.addIfNotExist(request, response);
        } else {
            // invalid token
            response
                .status(401)
                .send({
                    success: false,
                    message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
                });
        }
    });

/**
 * Delete a user if exist route
 */
userRoutes.post('/user-delete',
    passport.authenticate(process.env.JWT_SCHEME, {session: false}), (request, response) => {
        const token = AuthUtils.retrieveToken(request.headers);
        if (AuthUtils.isValidToken(token)) {
            // valid token
            UserController.deleteIfExist(request, response);
        } else {
            // invalid token
            response
                .status(401)
                .send({
                    success: false,
                    message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
                });
        }
    });

/**
 * Returns the user that made the request route (whoami)
 */
userRoutes.get('/profile',
    passport.authenticate("jwt", {session: false}), (request, response) => {
        const token = AuthUtils.retrieveToken(request.headers);
        console.log({token})
        if (AuthUtils.isValidToken(token)) {
            // valid token
            response.send(request.user);
        } else {
            // invalid token
            response
                .status(401)
                .send({
                    success: false,
                    message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
                });
        }
    });


export default userRoutes;
