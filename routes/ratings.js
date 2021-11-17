import express from 'express';

import {createRating, fetchRating} from '../controllers/ratings.js';

const router = express.Router();

router.post('/create', createRating);
router.post('/fetch', fetchRating);

export default router;
