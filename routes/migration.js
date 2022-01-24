import express from "express";

import {
  migrateCompanies,
  migrateRatings,
  migrateUsers,
  migrateLogins,
  migrateRatingsLoop,
  generateLocationQRcode,
  locationSkills,
  testConnection,
  createFromOld,
  migrateAudits
} from "../controllers/migrationController.js";

const router = express.Router();

router.get("/migrateCompanies", migrateCompanies);

router.get("/migrateUsers", migrateUsers);

router.get("/migrateRatings", migrateRatings);

router.get("/migrateRatingsLoop", migrateRatingsLoop);

router.get("/migrateLogins", migrateLogins);

router.get("/generateLocationQRcode", generateLocationQRcode);

router.get("/locationSkills", locationSkills);

router.get("/testConnection", testConnection);

router.post("/createFromOld", createFromOld);

router.get("/migrateAudits", migrateAudits);

export default router;
