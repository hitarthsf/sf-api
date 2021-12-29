import express from 'express';

import {migrateCompanies, migrateRatings, migrateUsers, migrateLogins, updateMigratedLocationNames , migrateRatingsLoop , generateLocationQRcode ,
locationSkills } from '../controllers/migrationController.js';

const router = express.Router();

router.get('/migrateCompanies', migrateCompanies);

router.get('/migrateUsers', migrateUsers);

router.get('/migrateRatings', migrateRatings);

router.get('/migrateRatingsLoop', migrateRatingsLoop);

router.get('/migrateLogins', migrateLogins);

router.get('/updateMigratedLocationNames', updateMigratedLocationNames);

router.get('/generateLocationQRcode', generateLocationQRcode);

router.get('/locationSkills', locationSkills);

export default router;
