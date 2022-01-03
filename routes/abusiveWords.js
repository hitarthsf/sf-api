import express from "express";

import {
  getAbusiveWords,
  createAbusiveWords,
  deleteAbusiveWords,
} from "../controllers/abusiveWordsController.js";

const router = express.Router();

router.get("/fetchAbusiveWords", getAbusiveWords);
router.post("/createAbusiveWords", createAbusiveWords);
router.post("/deleteAbusiveWords", deleteAbusiveWords);

export default router;
