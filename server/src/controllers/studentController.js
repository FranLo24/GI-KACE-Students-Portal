const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const registerStudent = async (req, res) => {
  const {
    fullName, gender, nationality, idType, idTypeOther, idNumber,
    phoneNumber, alternativePhone, emailAddress, residentialAddress, cityTown,
    highestEducation, highestEducationOther, fieldOfStudy,
    employmentStatus, organizationName, jobTitle, yearsOfExperience,
    courseTitle, courseCategory, courseCategoryOther,
    computerLiteracy, relevantSkills,
    emergencyName, emergencyRelationship, emergencyPhone,
  } = req.body;

  const required = { fullName, gender, nationality, idType, idNumber, phoneNumber, emailAddress, residentialAddress, cityTown, highestEducation, fieldOfStudy, employmentStatus, courseTitle, courseCategory, computerLiteracy, emergencyName, emergencyRelationship, emergencyPhone };
  for (const [field, value] of Object.entries(required)) {
    if (!value) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  try {
    const student = await prisma.student.create({
      data: {
        fullName, gender, nationality, idType, idTypeOther: idTypeOther || null, idNumber,
        phoneNumber, alternativePhone: alternativePhone || null, emailAddress, residentialAddress, cityTown,
        highestEducation, highestEducationOther: highestEducationOther || null, fieldOfStudy,
        employmentStatus, organizationName: organizationName || null, jobTitle: jobTitle || null, yearsOfExperience: yearsOfExperience || null,
        courseTitle, courseCategory, courseCategoryOther: courseCategoryOther || null,
        computerLiteracy, relevantSkills: relevantSkills || null,
        emergencyName, emergencyRelationship, emergencyPhone,
      },
    });
    res.status(201).json({ message: 'Registration successful', student });
  } catch (error) {
    console.error('Register student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllStudents = async (req, res) => {
  const { q } = req.query;
  try {
    const students = await prisma.student.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q } },
              { emailAddress: { contains: q } },
              { phoneNumber: { contains: q } },
              { courseCategory: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStudentById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    console.error('Get student by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateStudent = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  const {
    fullName, gender, nationality, idType, idTypeOther, idNumber,
    phoneNumber, alternativePhone, emailAddress, residentialAddress, cityTown,
    highestEducation, highestEducationOther, fieldOfStudy,
    employmentStatus, organizationName, jobTitle, yearsOfExperience,
    courseTitle, courseCategory, courseCategoryOther,
    computerLiteracy, relevantSkills,
    emergencyName, emergencyRelationship, emergencyPhone,
  } = req.body;

  try {
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Student not found' });

    const student = await prisma.student.update({
      where: { id },
      data: {
        fullName, gender, nationality, idType, idTypeOther: idTypeOther || null, idNumber,
        phoneNumber, alternativePhone: alternativePhone || null, emailAddress, residentialAddress, cityTown,
        highestEducation, highestEducationOther: highestEducationOther || null, fieldOfStudy,
        employmentStatus, organizationName: organizationName || null, jobTitle: jobTitle || null, yearsOfExperience: yearsOfExperience || null,
        courseTitle, courseCategory, courseCategoryOther: courseCategoryOther || null,
        computerLiteracy, relevantSkills: relevantSkills || null,
        emergencyName, emergencyRelationship, emergencyPhone,
      },
    });
    res.json({ message: 'Student updated', student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteStudent = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid student ID' });

  try {
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Student not found' });

    await prisma.student.delete({ where: { id } });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };
