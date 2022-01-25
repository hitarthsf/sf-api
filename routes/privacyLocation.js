import express from "express";

import {
  getPrivacyLocation,
  createPrivacyLocation,
  deletePrivacyLocation,
} from "../controllers/privacyLocationController.js";

const router = express.Router();

router.post("/fetchPrivacyLocation", getPrivacyLocation);
router.post("/createPrivacyLocation", createPrivacyLocation);
router.post("/deletePrivacyLocation", deletePrivacyLocation);

export default router;
