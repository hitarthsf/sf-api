import express from 'express';

import {migrateCompanies, migrateRatings, migrateUsers, migrateLogins, updateMigratedLocationNames , migrateRatingsLoop , generateLocationQRcode} from '../controllers/migrationController.js';

const router = express.Router();

router.get('/migrateCompanies', migrateCompanies);

router.get('/migrateUsers', migrateUsers);

router.get('/migrateRatings', migrateRatings);

router.get('/migrateRatingsLoop', migrateRatingsLoop);

router.get('/migrateLogins', migrateLogins);

router.get('/updateMigratedLocationNames', updateMigratedLocationNames);

router.get('/generateLocationQRcode', generateLocationQRcode);

export default router;
