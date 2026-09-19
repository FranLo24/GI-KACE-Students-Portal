const { PrismaClient } = require('@prisma/client');
const { syncCoursesFromInvoice } = require('../services/invoiceCourseSync');

const prisma = new PrismaClient();

// The catalogue is the invoice site's: only courses the sync owns (syncKey set)
// are listed, so every course on offer can actually be invoiced. Courses created
// by hand before the portal moved to invoice-only courses stay in the database,
// keeping their students' records intact, but are no longer shown.
const SYNCED_ONLY = { syncKey: { not: null } };

const getPublicCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { ...SYNCED_ONLY, enabled: true },
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
      where: SYNCED_ONLY,
      orderBy: { order: 'asc' },
      include: { locationFees: true },
    });
    res.json(courses);
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const syncCourses = async (req, res) => {
  try {
    const result = await syncCoursesFromInvoice();
    if (result.skipped) {
      return res.status(400).json({ message: result.reason });
    }
    res.json({
      message: `Synced ${result.totalCourses} course(s): ${result.created} created, ${result.adopted} matched to existing courses, ${result.updated} updated, ${result.disabled} disabled.`,
      ...result,
    });
  } catch (error) {
    console.error('Sync courses from invoice error:', error);
    res.status(502).json({ message: error.message || 'Failed to sync courses from the invoice site.' });
  }
};

module.exports = {
  getPublicCourses,
  getAdminCourses,
  syncCourses,
};
