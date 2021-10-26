import express from 'express';

import {getData , getLocationRank , getRatingsDistribution , getRatingData , latestReview , getSkillRank , getEmployeeRank} from '../controllers/dashboard.js';

const router = express.Router();

router.post('/getData', getData);
router.post('/getLocationRank', getLocationRank);
router.post('/getRatingsDistribution', getRatingsDistribution);
router.post('/getRatingData', getRatingData);
router.post('/latestReview', latestReview);
router.post('/getSkillRank', getSkillRank);
router.post('/getEmployeeRank', getEmployeeRank);

export default router;
