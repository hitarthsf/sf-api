import express from 'express';

import { getAttribute , addAttribute , updateAttribute , deleteAttribute } from '../controllers/attribute.js';

const router = express.Router();

router.post('/fetchAttribute',getAttribute);
router.post('/addAttribute', addAttribute);
router.post('/deleteAttribute', deleteAttribute);
router.post('/updateAttribute', updateAttribute);

router.get('/test', function (req, res) {
  res.send('test home page');
})
export default router;