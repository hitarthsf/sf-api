import express from "express";

import {
    adminMail,
    locationManagerMail,
    employeeMail

} from "../controllers/cronController.js";

const router = express.Router();

router.get("/adminMail", adminMail);
router.get("/locationManagerMail", locationManagerMail);
router.get("/employeeMail", employeeMail);

export default router;
