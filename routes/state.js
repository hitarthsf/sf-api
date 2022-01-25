import express from "express";

import { getStateList } from "../controllers/stateController.js";

const router = express.Router();

router.get("/fetchStateList", getStateList);
export default router;
