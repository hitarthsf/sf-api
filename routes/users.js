import express from 'express';

import {createUser,getUser, updateUser, deleteUser, uploadPhoto, getUsersByType , singleUser , getLocationIdByUser , getLocationByUser , getUserByLocationId} from '../controllers/users.js';

const router = express.Router();

router.post('/createUser', createUser);
router.post('/fetchUser',getUser);
router.post('/editUser', updateUser);
router.post('/deleteUser',  deleteUser);
router.post('/uploadphoto',  uploadPhoto);
router.get('/getUsersByType',  getUsersByType);
router.get('/singleUser',  singleUser);
router.get('/getLocationIdByUser',  getLocationIdByUser);
router.get('/getLocationByUser',  getLocationByUser);
router.get('/getUserByLocationId',  getUserByLocationId);

export default router;
