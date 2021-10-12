import express from 'express';

import {migrateCompanies, migrateUsers} from '../controllers/migrationController.js';

const router = express.Router();

router.get('/migrateCompanies', migrateCompanies);

router.get('/migrateUsers', migrateUsers);

export default router;
