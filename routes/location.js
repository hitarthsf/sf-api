import express from "express";

import {
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
  addDiscussLog,
  getSingleLocation,
  updateSingleLocation,
} from "../controllers/locationController.js";

const router = express.Router();

router.post("/createLocation", createLocation);
router.get("/fetchLocation", getLocation);
router.post("/updateLocation", updateLocation);
router.post("/deleteLocation", deleteLocation);
router.post("/addDiscussLog", addDiscussLog);
router.post("/getSingleLocation", getSingleLocation);
router.post("/updateSingleLocation", updateSingleLocation);
export default router;
