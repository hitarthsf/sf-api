import express from "express";

import {
  getData,
  getLocationRank,
  getRatingsDistribution,
  getRatingData,
  latestReview,
  getSkillRank,
  getAttributeRank,
  getEmployeeRank,
  getUserStats,
  getUserStatDetails,
} from "../controllers/dashboard.js";

const router = express.Router();

router.post("/getData", getData);
router.post("/getLocationRank", getLocationRank);
router.post("/getRatingsDistribution", getRatingsDistribution);
router.post("/getRatingData", getRatingData);
router.post("/latestReview", latestReview);
router.post("/getSkillRank", getSkillRank);
router.post("/getAttributeRank", getAttributeRank);
router.post("/getEmployeeRank", getEmployeeRank);
router.get("/getUserStats", getUserStats);
router.get("/getUserStatDetails", getUserStatDetails);

export default router;
