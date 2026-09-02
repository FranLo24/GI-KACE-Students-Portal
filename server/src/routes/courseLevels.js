const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getCourseLevels, setCourseLevel } = require('../controllers/courseLevelController');

router.get('/course-levels', getCourseLevels);
router.put('/admin/course-levels/:category', verifyToken, setCourseLevel);

module.exports = router;
