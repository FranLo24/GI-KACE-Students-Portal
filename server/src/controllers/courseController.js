const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getPublicCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
      include: { locationFees: true },
    });
    res.json(courses);
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAdminCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: 'asc' },
      include: { locationFees: true },
    });
    res.json(courses);
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCourse = async (req, res) => {
  const { title, category, description, outcomes, spotlight, imageUrl } = req.body;

  if (!title?.trim() || !category?.trim()) {
    return res.status(400).json({ message: 'title and category are required' });
  }

  try {
    const maxOrder = await prisma.course.aggregate({ _max: { order: true } });

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        description: description?.trim() || null,
        outcomes: outcomes?.trim() || null,
        spotlight: spotlight?.trim() || null,
        imageUrl: imageUrl || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: { locationFees: true },
    });
    res.status(201).json({ message: 'Course created', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid course ID' });

  const { title, category, description, outcomes, spotlight, imageUrl, enabled } = req.body;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(category !== undefined ? { category: category.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(outcomes !== undefined ? { outcomes: outcomes?.trim() || null } : {}),
        ...(spotlight !== undefined ? { spotlight: spotlight?.trim() || null } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
      },
      include: { locationFees: true },
    });
    res.json({ message: 'Course updated', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid course ID' });

  try {
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const reorderCourses = async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ message: 'order must be a non-empty array of course IDs' });
  }

  try {
    await prisma.$transaction(
      order.map((id, index) => prisma.course.update({ where: { id: Number(id) }, data: { order: index } }))
    );
    res.json({ message: 'Courses reordered' });
  } catch (error) {
    console.error('Reorder courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const setCourseFees = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid course ID' });

  const { fees } = req.body;
  if (typeof fees !== 'object' || fees === null || Array.isArray(fees)) {
    return res.status(400).json({ message: 'fees must be an object mapping location to fee' });
  }

  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await prisma.$transaction(
      Object.entries(fees).map(([location, fee]) =>
        fee === null || fee === ''
          ? prisma.courseFee.deleteMany({ where: { courseId: id, location } })
          : prisma.courseFee.upsert({
              where: { courseId_location: { courseId: id, location } },
              update: { fee: Number(fee) },
              create: { courseId: id, location, fee: Number(fee) },
            })
      )
    );

    const updated = await prisma.course.findUnique({ where: { id }, include: { locationFees: true } });
    res.json({ message: 'Course fees updated', course: updated });
  } catch (error) {
    console.error('Set course fees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPublicCourses,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses,
  setCourseFees,
};
