import express from "express";

import {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryContoller.js";

const router = express.Router();

router.post("/createCategory", createCategory);
router.post("/fetchCategory", getCategory);
router.post("/updateCategory", updateCategory);
router.post("/deleteCategory", deleteCategory);

export default router;
