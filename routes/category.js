import express from 'express';

import {createCategory} from '../controllers/category.js';

const router = express.Router();

router.post('/createCategory', createCategory);
// router.get('/fetchCategory',getCategory);
// router.post('/updateCategory', updateCategory);
// router.post('/deleteCategory',  deleteCategory);


export default router;