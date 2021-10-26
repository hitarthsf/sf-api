import express from 'express';

import {migrateCompanies, migrateRatings, migrateUsers} from '../controllers/migrationController.js';

const router = express.Router();

router.get('/migrateCompanies', migrateCompanies);

router.get('/migrateUsers', migrateUsers);

router.get('/migrateRatings', migrateRatings);

export default router;
