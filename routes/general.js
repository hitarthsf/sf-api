import express from "express";

import { generateReportPdf } from "../controllers/generalController.js";

const router = express.Router();

router.post("/generateReportPdf", generateReportPdf);

export default router;
