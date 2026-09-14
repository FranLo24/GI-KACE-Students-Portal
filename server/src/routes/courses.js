const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getPublicCourses,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses,
  setCourseFees,
  syncCourses,
} = require('../controllers/courseController');

router.get('/courses', getPublicCourses);

router.get('/admin/courses', verifyToken, getAdminCourses);
router.post('/admin/courses', verifyToken, createCourse);
router.post('/admin/courses/sync', verifyToken, syncCourses);
router.put('/admin/courses/reorder', verifyToken, reorderCourses);
router.put('/admin/courses/:id/fees', verifyToken, setCourseFees);
router.put('/admin/courses/:id', verifyToken, updateCourse);
router.delete('/admin/courses/:id', verifyToken, deleteCourse);

module.exports = router;


