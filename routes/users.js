import express from 'express';

import {createUser,getUser, updateUser, deleteUser, uploadPhoto, getUsersByType , singleUser} from '../controllers/users.js';

const router = express.Router();

router.post('/createUser', createUser);
router.post('/fetchUser',getUser);
router.post('/editUser', updateUser);
router.post('/deleteUser',  deleteUser);
router.post('/uploadphoto',  uploadPhoto);
router.get('/getUsersByType',  getUsersByType);
router.get('/singleUser',  singleUser);
export default router;
