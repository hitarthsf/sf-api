import express from 'express';

import {createCompany, getCompany, updateCompany, deleteCompany,updateLocation,getLocation , migration , getActionPlan} from '../controllers/company.js';

const router = express.Router();

router.post('/createCompany', createCompany);
router.get('/fetchCompany',getCompany);
router.post('/fetchLocation',getLocation);
router.post('/updateCompany', updateCompany);
router.post('/updateLocation', updateLocation);
router.post('/deleteCompany',  deleteCompany);

router.get('/test', function (req, res) {
  res.send('test home page');
})



router.post('/migration', migration);
export default router;