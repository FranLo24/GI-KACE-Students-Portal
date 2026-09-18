const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getInvoiceCourses } = require('../controllers/invoiceController');

router.get('/admin/invoice-courses', verifyToken, getInvoiceCourses);

module.exports = router;
