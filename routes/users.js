import express from 'express';

import {createUser,getUser, updateUser, deleteUser} from '../controllers/users.js';

const router = express.Router();

router.post('/createUser', createUser);
router.post('/fetchUser',getUser);
router.post('/editUser', updateUser);
router.post('/deleteUser',  deleteUser);

export default router;