import express from 'express';

import {getData} from '../controllers/dashboard.js';

const router = express.Router();

router.post('/getData', getData);


export default router;
