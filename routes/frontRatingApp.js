import express from "express";

import {
  locationLogin,
  getSkills,
  getEmployee,
} from "../controllers/frontRatingApp.js";

const router = express.Router();

router.post("/locationLogin", locationLogin);
router.post("/getSkills", getSkills);
router.post("/getEmployee", getEmployee);

export default router;
