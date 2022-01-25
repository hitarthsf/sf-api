import express from "express";

import {
  getActionPlan,
  addActionPlan,
  deleteActionPlan,
  updateActionPlan,
  createActionPlanSkill,
} from "../controllers/actionPlanController.js";

const router = express.Router();

router.post("/fetchActionPlan", getActionPlan);
router.post("/addActionPlan", addActionPlan);
router.post("/deleteActionPlan", deleteActionPlan);
router.post("/updateActionPlan", updateActionPlan);
router.post("/createActionPlanSkill", createActionPlanSkill);

export default router;
