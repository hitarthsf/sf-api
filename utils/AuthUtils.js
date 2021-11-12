import jwt from 'jsonwebtoken';
import UsersData from '../models/UsersData.js';

/**
 * verify if token is valid
 * @param {*} token
 * @return {boolean}
 */
const isValidToken = (token) => {
    
    try {
        jwt.verify(token, process.env.JWT_SECRET_OR_KEY);
        return true;
    } catch (error) {
        // error
        return false;
    }
};

/**
 * retrieve token from header
 * @param {*} headers
 * @return {string} token or null
 */
const retrieveToken = (headers) => {
    if (headers && headers.authorization) {
        const tokens = headers.authorization.split(' ');
        if (tokens && tokens.length === 2) {
            return tokens[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

const hasPermission = (token, company_id) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_OR_KEY);
        if (decoded.type === 'super_admin') {
            return true;
        } else return decoded.company_id === company_id;
    } catch (error) {
        // error
        return false;
    }
}

const AuthUtils = {
    isValidToken,
    retrieveToken,
    hasPermission,
};

export default AuthUtils;
