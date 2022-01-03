import express from "express";

import {
  addScreenSaver,
  editScreenSaver,
  fetchScreenSaver,
  deleteScreenSaver,
} from "../controllers/screenSaverController.js";

const router = express.Router();

router.post("/addScreenSaver", addScreenSaver);
router.post("/editScreenSaver", editScreenSaver);
router.post("/fetchScreenSaver", fetchScreenSaver);
router.post("/deleteScreenSaver", deleteScreenSaver);

export default router;
