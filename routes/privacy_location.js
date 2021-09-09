import express from 'express';

import { getPrivacyLocation , createPrivacyLocation , deletePrivacyLocation } from '../controllers/privacyLocation.js';

const router = express.Router();

router.get('/fetchPrivacyLocation',getPrivacyLocation );
router.post('/createPrivacyLocation',createPrivacyLocation );
router.post('/deletePrivacyLocation',deletePrivacyLocation );

export default router;
