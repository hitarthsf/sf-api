import express from 'express';

import {addClientSurvey } from '../controllers/clientSurveyController.js';

const router = express.Router();

router.post('/addClientSurvey', addClientSurvey);


export default router;