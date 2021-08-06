import express from 'express';

import { getAttribute} from '../controllers/attribute.js';

const router = express.Router();

router.get('/fetchAttribute',getAttribute);


export default router;