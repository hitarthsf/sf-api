import express from "express";

import {
  getActionPlan,
  addActionPlan,
  deleteActionPlan,
  updateActionPlan,
  createActionPlanSkill,

} from "../controllers/actionPlanController.js";

const router = express.Router();

router.get("/fetchActionPlan", getActionPlan);
router.post("/addActionPlan", addActionPlan);
router.post("/deleteActionPlan", deleteActionPlan);
router.post("/updateActionPlan", updateActionPlan);
router.post("/createActionPlanSkill", createActionPlanSkill);

export default router;
