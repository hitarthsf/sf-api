import express from "express";

import {
  sendMail,
  getHubspotCompanies,
  createContact,
  deleteContact,
  assignContactToCompany
} from "../controllers/hubspotController.js";

const router = express.Router();

router.post("/sendMail", sendMail);
router.get("/getHubspotCompanies", getHubspotCompanies);
router.post("/createContact", createContact);
router.put("/assignContactToCompany", assignContactToCompany);

export default router;
