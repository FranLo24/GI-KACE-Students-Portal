const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizeEmail(emailAddress = '') {
  return emailAddress.trim().toLowerCase();
}

function normalizePhone(phoneNumber = '') {
  return phoneNumber.replace(/\D/g, '');
}

function buildDuplicatePayload(duplicates, emailAddress, phoneNumber) {
  const fieldErrors = {};

  if (duplicates.some((student) => student.emailAddress === emailAddress)) {
    fieldErrors.emailAddress = 'This email address has already been used for a registration.';
  }

  if (duplicates.some((student) => student.phoneNumber === phoneNumber)) {
    fieldErrors.phoneNumber = 'This phone number has already been used for a registration.';
  }

  const messages = Object.values(fieldErrors);

  return {
    message:
      messages.length > 1
        ? 'This email address and phone number have already been used for a registration.'
        : messages[0],
    fieldErrors,
  };
}

async function findDuplicateStudents({ emailAddress, phoneNumber, excludeId }) {
  return prisma.student.findMany({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [{ emailAddress }, { phoneNumber }],
    },
    select: {
      emailAddress: true,
      phoneNumber: true,
    },
  });
}

function handleUniqueConstraintError(error, res) {
  if (error.code !== 'P2002') {
    return false;
  }

  const targets = Array.isArray(error.meta?.target) ? error.meta.target : [error.meta?.target].filter(Boolean);
  const fieldErrors = {};

  if (targets.includes('emailAddress')) {
    fieldErrors.emailAddress = 'This email address has already been used for a registration.';
  }

  if (targets.includes('phoneNumber')) {
    fieldErrors.phoneNumber = 'This phone number has already been used for a registration.';
  }

  const messages = Object.values(fieldErrors);

  res.status(409).json({
    message:
      messages.length > 1
        ? 'This email address and phone number have already been used for a registration.'
        : messages[0] || 'A registration with this email address or phone number already exists.',
    fieldErrors,
  });

  return true;
}

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

  const normalizedEmailAddress = normalizeEmail(emailAddress);
  const normalizedPhoneNumber = normalizePhone(phoneNumber);
  const normalizedAlternativePhone = alternativePhone ? normalizePhone(alternativePhone) : null;
  const normalizedEmergencyPhone = normalizePhone(emergencyPhone);

  const required = {
    fullName,
    gender,
    nationality,
    idType,
    idNumber,
    phoneNumber: normalizedPhoneNumber,
    emailAddress: normalizedEmailAddress,
    residentialAddress,
    cityTown,
    highestEducation,
    fieldOfStudy,
    employmentStatus,
    courseTitle,
    courseCategory,
    computerLiteracy,
    emergencyName,
    emergencyRelationship,
    emergencyPhone: normalizedEmergencyPhone,
  };

  for (const [field, value] of Object.entries(required)) {
    if (!value) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  try {
    const duplicates = await findDuplicateStudents({
      emailAddress: normalizedEmailAddress,
      phoneNumber: normalizedPhoneNumber,
    });

    if (duplicates.length > 0) {
      return res.status(409).json(buildDuplicatePayload(duplicates, normalizedEmailAddress, normalizedPhoneNumber));
    }

    const student = await prisma.student.create({
      data: {
        fullName,
        gender,
        nationality,
        idType,
        idTypeOther: idTypeOther || null,
        idNumber,
        phoneNumber: normalizedPhoneNumber,
        alternativePhone: normalizedAlternativePhone,
        emailAddress: normalizedEmailAddress,
        residentialAddress,
        cityTown,
        highestEducation,
        highestEducationOther: highestEducationOther || null,
        fieldOfStudy,
        employmentStatus,
        organizationName: organizationName || null,
        jobTitle: jobTitle || null,
        yearsOfExperience: yearsOfExperience || null,
        courseTitle,
        courseCategory,
        courseCategoryOther: courseCategoryOther || null,
        computerLiteracy,
        relevantSkills: relevantSkills || null,
        emergencyName,
        emergencyRelationship,
        emergencyPhone: normalizedEmergencyPhone,
      },
    });

    res.status(201).json({ message: 'Registration successful', student });
  } catch (error) {
    if (handleUniqueConstraintError(error, res)) {
      return;
    }

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

  const normalizedEmailAddress = normalizeEmail(emailAddress);
  const normalizedPhoneNumber = normalizePhone(phoneNumber);
  const normalizedAlternativePhone = alternativePhone ? normalizePhone(alternativePhone) : null;
  const normalizedEmergencyPhone = normalizePhone(emergencyPhone);

  try {
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Student not found' });

    const duplicates = await findDuplicateStudents({
      emailAddress: normalizedEmailAddress,
      phoneNumber: normalizedPhoneNumber,
      excludeId: id,
    });

    if (duplicates.length > 0) {
      return res.status(409).json(buildDuplicatePayload(duplicates, normalizedEmailAddress, normalizedPhoneNumber));
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        fullName,
        gender,
        nationality,
        idType,
        idTypeOther: idTypeOther || null,
        idNumber,
        phoneNumber: normalizedPhoneNumber,
        alternativePhone: normalizedAlternativePhone,
        emailAddress: normalizedEmailAddress,
        residentialAddress,
        cityTown,
        highestEducation,
        highestEducationOther: highestEducationOther || null,
        fieldOfStudy,
        employmentStatus,
        organizationName: organizationName || null,
        jobTitle: jobTitle || null,
        yearsOfExperience: yearsOfExperience || null,
        courseTitle,
        courseCategory,
        courseCategoryOther: courseCategoryOther || null,
        computerLiteracy,
        relevantSkills: relevantSkills || null,
        emergencyName,
        emergencyRelationship,
        emergencyPhone: normalizedEmergencyPhone,
      },
    });
    res.json({ message: 'Student updated', student });
  } catch (error) {
    if (handleUniqueConstraintError(error, res)) {
      return;
    }

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
