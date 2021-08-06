import express from 'express';

import {createLocation, getLocation,updateLocation,deleteLocation} from '../controllers/location.js';

const router = express.Router();

router.post('/createLocation', createLocation);
router.get('/fetchLocation',getLocation);
router.post('/updateLocation', updateLocation);
router.post('/deleteLocation', deleteLocation);

export default router;