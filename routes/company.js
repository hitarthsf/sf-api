import express from 'express';

import {createCompany, getCompany, updateCompany, deleteCompany,updateLocation,getLocation , getAttribute , addAttribute , updateAttribute , deleteAttribute , migration} from '../controllers/company.js';

const router = express.Router();

router.post('/createCompany', createCompany);
router.get('/fetchCompany',getCompany);
router.post('/fetchLocation',getLocation);
router.post('/updateCompany', updateCompany);
router.post('/updateLocation', updateLocation);
router.post('/deleteCompany',  deleteCompany);

router.get('/fetchAttribute',getAttribute);
router.post('/addAttribute', addAttribute);
router.post('/deleteAttribute', deleteAttribute);
router.post('/updateAttribute', updateAttribute);


router.post('/migration', migration);
export default router;