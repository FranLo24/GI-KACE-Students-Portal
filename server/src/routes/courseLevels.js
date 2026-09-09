const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getCourseLevels, setCourseLevel, deleteCourseLevel } = require('../controllers/courseLevelController');

router.get('/course-levels', getCourseLevels);
router.put('/admin/course-levels/:category', verifyToken, setCourseLevel);
router.delete('/admin/course-levels/:category', verifyToken, deleteCourseLevel);

module.exports = router;
