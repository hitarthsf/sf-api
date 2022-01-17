import express from "express";

import {
    adminMail
} from "../controllers/cronController.js";

const router = express.Router();

router.get("/adminMail", adminMail);

export default router;
