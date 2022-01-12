import express from "express";

import {
  sendMail,
  getHubspotCompanies,
  createContact,
  deleteContact,
  assignContactToCompany
} from "../controllers/HubspotController.js";

const router = express.Router();

router.post("/sendMail", sendMail);
router.get("/getHubspotCompanies", getHubspotCompanies);
router.post("/createContact", createContact);
router.post("/assignContactToCompany", assignContactToCompany);

export default router;
