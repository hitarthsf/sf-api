import express from 'express';

import {migrateCompanies, migrateRatings, migrateUsers, migrateLogins, updateMigratedLocationNames} from '../controllers/migrationController.js';

const router = express.Router();

router.get('/migrateCompanies', migrateCompanies);

router.get('/migrateUsers', migrateUsers);

router.get('/migrateRatings', migrateRatings);

router.get('/migrateLogins', migrateLogins);

router.get('/updateMigratedLocationNames', updateMigratedLocationNames);

export default router;
