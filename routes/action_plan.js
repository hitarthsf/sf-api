import express from "express";

import {
  getActionPlan,
  addActionPlan,
  deleteActionPlan,
  updateActionPlan,
} from "../controllers/action_plan.js";

const router = express.Router();

router.get("/fetchActionPlan", getActionPlan);
router.post("/addActionPlan", addActionPlan);
router.post("/deleteActionPlan", deleteActionPlan);
router.post("/updateActionPlan", updateActionPlan);

export default router;
