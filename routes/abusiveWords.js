import express from "express";
import AuthUtils from "../utils/AuthUtils.js";
import {
  getAbusiveWords,
  createAbusiveWords,
  deleteAbusiveWords,
} from "../controllers/abusiveWordsController.js";

const router = express.Router();

router.post("/fetchAbusiveWords", getAbusiveWords);
router.post("/createAbusiveWords", createAbusiveWords);
router.post("/deleteAbusiveWords", deleteAbusiveWords);

export default router;
