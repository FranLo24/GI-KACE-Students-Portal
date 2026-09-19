const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const getCourseLevels = async (req, res) => {
  try {
    const [rows, courses] = await Promise.all([
      prisma.courseLevel.findMany(),
      // The catalogue is the invoice site's, so only synced courses have levels
      // to assign. Disabled ones stay listed — a course the sync has retired
      // keeps its level for when it returns — but courses created by hand before
      // the portal moved to invoice-only courses are no longer part of it. Their
      // saved levels stay in the database, they're just not listed any more.
      prisma.course.findMany({ where: { syncKey: { not: null } }, select: { category: true } }),
    ]);
    const levelByCategory = new Map(rows.map((row) => [row.category, row.level]));

    const categories = new Set(courses.map((course) => course.category));

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
