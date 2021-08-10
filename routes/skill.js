import express from 'express';

import {createSkill, getSkill, updateSkill, deleteSkill} from '../controllers/skill.js';

const router = express.Router();

router.post('/createSkill', createSkill);
router.get('/fetchSkill',getSkill);
router.post('/updateSkill', updateSkill);
router.post('/deleteSkill',  deleteSkill);

export default router;