import express from 'express';

import { addCustomerAuditQuestion , editCustomerAuditQuestion , fetchCustomerAuditQuestion , deleteCustomerAuditQuestion , fetchSingleCustomerAuditQuestion , addCustomerAudit ,
editCustomerAudit , deleteCustomerAudit , fetchCustomerAudit } from '../controllers/customerAuditController.js';

const router = express.Router();

router.post('/addCustomerAuditQuestion', addCustomerAuditQuestion);
router.post('/editCustomerAuditQuestion', editCustomerAuditQuestion);
router.post('/fetchCustomerAuditQuestion', fetchCustomerAuditQuestion);
router.post('/deleteCustomerAuditQuestion', deleteCustomerAuditQuestion);
router.post('/fetchSingleCustomerAuditQuestion', fetchSingleCustomerAuditQuestion);
router.post('/addCustomerAudit', addCustomerAudit);
router.post('/editCustomerAudit', editCustomerAudit);
router.post('/deleteCustomerAudit', deleteCustomerAudit);
router.post('/fetchCustomerAudit', fetchCustomerAudit);

export default router;
