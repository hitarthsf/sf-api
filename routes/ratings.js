import express from "express";

import {
  createRating,
  fetchRating,
  singleRating,
  complaintManagement,
  ratingChat,
  changeStatus
} from "../controllers/ratingsController.js";

const router = express.Router();

router.post("/create", createRating);
router.post("/fetch", fetchRating);
router.post("/singleRating", singleRating);
router.post("/complaintManagement", complaintManagement);
router.post("/ratingChat", ratingChat);
router.post("/changeStatus", changeStatus);
export default router;
