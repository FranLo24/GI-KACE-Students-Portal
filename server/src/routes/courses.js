const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getPublicCourses, getAdminCourses, syncCourses } = require('../controllers/courseController');

// Courses come from the invoice site only, so the catalogue is read-only here:
// the sync is the single way courses, prices and locations change.
router.get('/courses', getPublicCourses);

router.get('/admin/courses', verifyToken, getAdminCourses);
router.post('/admin/courses/sync', verifyToken, syncCourses);

module.exports = router;
