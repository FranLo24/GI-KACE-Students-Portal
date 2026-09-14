const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
} = require('../controllers/studentController');
const { admitStudent, bulkAdmitStudents } = require('../controllers/admissionController');

router.post('/register', registerStudent);

router.get('/admin/students', verifyToken, getAllStudents);

router.post('/admin/students/bulk-admit', verifyToken, bulkAdmitStudents);
router.post('/admin/students/bulk-delete', verifyToken, bulkDeleteStudents);

router.get('/admin/students/:id', verifyToken, getStudentById);
router.put('/admin/students/:id', verifyToken, updateStudent);
router.delete('/admin/students/:id', verifyToken, deleteStudent);
router.post('/admin/students/:id/admit', verifyToken, admitStudent);

module.exports = router;
