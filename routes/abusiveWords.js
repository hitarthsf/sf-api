import express from "express";
import AuthUtils from "../utils/AuthUtils.js";
import {
  getAbusiveWords,
  createAbusiveWords,
  deleteAbusiveWords,
} from "../controllers/abusiveWordsController.js";
import { default as passport } from "../utils/passport.js";
const router = express.Router();

router.get("/fetchAbusiveWords", getAbusiveWords);
router.post("/createAbusiveWords", createAbusiveWords);
router.post("/deleteAbusiveWords", deleteAbusiveWords);

export default router;
