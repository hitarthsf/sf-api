import express from "express";

import {
  createSkillProfile,
  fetchSkillProfile,
  editSkillProfile,
  deleteSkillProfile,
  singleSkillProfile,
} from "../controllers/skillProfileController.js";

const router = express.Router();

router.post("/createSkillProfile", createSkillProfile);
router.post("/fetchSkillProfile", fetchSkillProfile);
router.post("/editSkillProfile", editSkillProfile);
router.post("/deleteSkillProfile", deleteSkillProfile);
router.post("/singleSkillProfile", singleSkillProfile);

export default router;
