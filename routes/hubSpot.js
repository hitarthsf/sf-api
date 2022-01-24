import express from "express";

import {
  sendMail,
  getHubspotCompanies,
  createContact,
  assignContactToCompany,
  sendMailDefault,
  assignContactToCompany
} from "../controllers/HubspotController.js";


const router = express.Router();

router.post("/sendMailDefault", sendMailDefault);
router.post("/sendMail", sendMail);
router.get("/getHubspotCompanies", getHubspotCompanies);
router.post("/createContact", createContact);
router.put("/assignContactToCompany", assignContactToCompany);

export default router;
