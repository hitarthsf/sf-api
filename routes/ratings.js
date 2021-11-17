import express from 'express';

import {createRating, fetchRating , singleRating} from '../controllers/ratings.js';

const router = express.Router();

router.post('/create', createRating);
router.post('/fetch', fetchRating);
router.get('/singleRating', singleRating);
export default router;
