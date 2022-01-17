import express from "express";

import {
  addTag,
  editTag,
  deleteTag,
  fetchTag,
} from "../controllers/tagController.js";

const router = express.Router();

router.post("/addTag", addTag);
router.post("/editTag", editTag);
router.post("/fetchTag", fetchTag);
router.post("/deleteTag", deleteTag);

export default router;
