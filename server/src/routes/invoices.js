const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getInvoiceCourses, lookupInvoiceReference } = require('../controllers/invoiceController');

router.get('/admin/invoice-courses', verifyToken, getInvoiceCourses);
router.get('/admin/invoice-lookup', verifyToken, lookupInvoiceReference);

module.exports = router;
