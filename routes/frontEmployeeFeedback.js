import express from "express";

import {
    getSkill,
    saveFeedback,
    employeeList
} from "../controllers/frontEmployeeFeedbackController.js";

const router = express.Router();

router.post("/getSkill", getSkill);
router.post("/saveFeedback", saveFeedback);
router.post("/employeeList", employeeList);

export default router;