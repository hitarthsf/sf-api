import express from "express";

import {
    skillList,
    employeeList,
    locationLogin,
    saveDetails,
    curlFunction,
    getAllData,
    skillFlag,
    migrateSecondaryLocation
} from "../controllers/apiController.js";

const router = express.Router();

router.post("/skillList", skillList);
router.post("/employeeList", employeeList);
router.post("/locationLogin", locationLogin);
router.post("/saveDetails", saveDetails);
router.post("/getAllData", getAllData);
router.post("/skillFlag", skillFlag);
router.post("/curlFunction", curlFunction);
router.post("/secondaryLocation", migrateSecondaryLocation);


export default router;
