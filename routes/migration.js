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
  migrateTags,
  migrateSecondaryLocation,
  migrateAudits,
  saveRatingData,
  saveRatingEmployee,
  saveRatingSkillData
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

router.get("/migrateTags", migrateTags);

router.post("/migrateSecondaryLocation", migrateSecondaryLocation);

router.get("/migrateAudits", migrateAudits);

router.get("/saveRatingData", saveRatingData);

router.get("/saveRatingEmployee", saveRatingEmployee);

router.get("/saveRatingSkillData", saveRatingSkillData);

export default router;
