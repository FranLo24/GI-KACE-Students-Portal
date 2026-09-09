const { PrismaClient } = require('@prisma/client');
const { COURSE_CATEGORIES } = require('../data/courseCategories');

const prisma = new PrismaClient();

const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const getCourseLevels = async (req, res) => {
  try {
    const rows = await prisma.courseLevel.findMany();
    const levelByCategory = new Map(rows.map((row) => [row.category, row.level]));

    const categories = new Set([...COURSE_CATEGORIES, ...levelByCategory.keys()]);

    const courseLevels = Array.from(categories).map((category) => ({
      category,
      level: levelByCategory.get(category) || null,
    }));

    res.json(courseLevels);
  } catch (error) {
    console.error('Get course levels error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const setCourseLevel = async (req, res) => {
  const { category } = req.params;
  const { level } = req.body;

  if (level !== null && !VALID_LEVELS.includes(level)) {
    return res.status(400).json({ message: 'level must be one of Beginner, Intermediate, Advanced, or null' });
  }

  try {
    const courseLevel = await prisma.courseLevel.upsert({
      where: { category },
      update: { level },
      create: { category, level },
    });

    res.json({ message: 'Course level updated', courseLevel });
  } catch (error) {
    console.error('Set course level error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCourseLevel = async (req, res) => {
  const { category } = req.params;

  try {
    await prisma.courseLevel.deleteMany({ where: { category } });
    res.json({ message: 'Course recommendation removed' });
  } catch (error) {
    console.error('Delete course level error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getCourseLevels, setCourseLevel, deleteCourseLevel };
