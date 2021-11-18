import {
  MesssageProvider,
  Messages,
} from '../core/index.js';
import AuthUtils from "../utils/AuthUtils.js";
import express from 'express';

const {
  Router,
} = express;

import {default as passport} from '../utils/passport.js';

const companyRoutes = Router();

import {createCompany, getCompany , getCompanyGet, updateCompany, deleteCompany,updateLocation,getLocation , migration , getLocationList, getSkillList, fetchLocationByLoggedInUser} from '../controllers/company.js';

companyRoutes.post('/createCompany', createCompany);
companyRoutes.post('/fetchCompany',getCompany);
companyRoutes.get('/fetchCompanyGet',getCompanyGet);
companyRoutes.post('/fetchLocation',getLocation);
companyRoutes.post('/updateCompany', updateCompany);
companyRoutes.post('/updateLocation', updateLocation);
companyRoutes.post('/deleteCompany',  deleteCompany);
companyRoutes.get('/fetchLocationList',getLocationList);
companyRoutes.get('/fetchSkillList',getSkillList);

companyRoutes.get('/test', function (req, res) {
  res.send('test home page');
})


companyRoutes.post('/migration', migration);

companyRoutes.get('/fetchLocationByLoggedInUser',
    passport.authenticate(process.env.JWT_SCHEME, {session: false}), (request, response) => {
      const token = AuthUtils.retrieveToken(request.headers);
      if (AuthUtils.hasPermission(token, request.body.company_id)) {
        // valid token
        return fetchLocationByLoggedInUser(request, response, token);
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

export default companyRoutes;
