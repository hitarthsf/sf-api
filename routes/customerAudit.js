import express from 'express';

import { addCustomerAuditQuestion , editCustomerAuditQuestion , fetchCustomerAuditQuestion , deleteCustomerAuditQuestion , fetchSingleCustomerAuditQuestion} from '../controllers/customerAudtiController.js';

const router = express.Router();

router.post('/addCustomerAuditQuestion', addCustomerAuditQuestion);
router.post('/editCustomerAuditQuestion', editCustomerAuditQuestion);
router.post('/fetchCustomerAuditQuestion', fetchCustomerAuditQuestion);
router.post('/deleteCustomerAuditQuestion', deleteCustomerAuditQuestion);
router.post('/fetchSingleCustomerAuditQuestion', fetchSingleCustomerAuditQuestion);


export default router;
