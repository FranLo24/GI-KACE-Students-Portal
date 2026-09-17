const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getInvoiceCourses, createStudentInvoice } = require('../controllers/invoiceController');

router.get('/admin/invoice-courses', verifyToken, getInvoiceCourses);
router.post('/admin/students/:id/invoice', verifyToken, createStudentInvoice);

module.exports = router;
