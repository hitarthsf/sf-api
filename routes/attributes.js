import express from "express";

import {
  getAttribute,
  addAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attributeController.js";

const router = express.Router();

router.post("/fetchAttribute", getAttribute);
router.post("/addAttribute", addAttribute);
router.post("/updateAttribute", updateAttribute);
router.post("/deleteAttribute", deleteAttribute);

export default router;
