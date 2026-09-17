const { PrismaClient } = require('@prisma/client');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const { parseIds } = require('../utils/parseIds');
const { BUILTIN_FIELD_KEYS, REQUIRED_DB_COLUMNS } = require('../data/builtinFieldKeys');

const prisma = new PrismaClient();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:0|\+233)\d{9}$/;
const PHONE_TYPE_FIELDS = ['phoneNumber', 'alternativePhone', 'emergencyPhone'];

// Ghana Card numbers follow a fixed GHA-XXXXXXXXX-X format (9 digits then a
// check digit), enforced only when ID Type is "Ghana Card" — otherwise the
// admin-configured idNumber pattern (validation.pattern) still applies.
const GHANA_CARD_ID_PATTERN = /^GHA-\d{9}-\d$/;
const GHANA_CARD_ID_MESSAGE = 'ID Number must be in the format GHA-XXXXXXXXX-X';

function normalizeEmail(emailAddress = '') {
  return emailAddress.trim().toLowerCase();
}

// Stores Ghanaian numbers in E.164 (+233…) so the same phone typed as
// "0241000008", "233241000008" or "+233 24 100 0008" always lands in the database
// identically — otherwise the unique constraint and the duplicate check below
// both treat those as three different people. It's also the format the e-invoice
// site and Arkesel expect. A number libphonenumber can't make sense of is stored
// as entered rather than mangled.
function normalizePhone(phoneNumber = '') {
  const parsed = parsePhoneNumberFromString(phoneNumber, 'GH');
  return parsed?.isValid() ? parsed.number : phoneNumber.trim();
}

// Links a registration to its catalogue row, so invoicing can resolve the invoice
// product id from the course's fees instead of re-matching course names later.
// Null for a course title with no catalogue entry — that student just can't be
// invoiced until their course exists and has been synced.
async function resolveCourseId(courseTitle) {
  if (!courseTitle) return null;

  const course = await prisma.course.findFirst({ where: { title: courseTitle } });
  return course?.id ?? null;
}

// Enabled fields, plus any NOT-NULL Student column even if an admin disabled
// its FormField — so a database write can never fail on a missing required
// column (see server/src/data/builtinFieldKeys.js).
async function loadActiveFormFields() {
  return prisma.formField.findMany({
    where: { OR: [{ enabled: true }, { key: { in: REQUIRED_DB_COLUMNS } }] },
  });
}

// Validates req.body against the current form field configuration and splits
// the result into Student columns vs. customFields JSON entries. Returns
// either { fieldErrors } or { studentData, customFields }.
function processDynamicFields(body, fields) {
  const values = {};
  fields.forEach((field) => {
    let value = body[field.key];
    if (typeof value === 'string') value = value.trim();
    values[field.key] = value;
  });

  const fieldErrors = {};

  fields.forEach((field) => {
    const isConditional = !!field.conditionalOn;
    const conditionMet = isConditional && values[field.conditionalOn.field] === field.conditionalOn.value;
    const isRequired = isConditional ? conditionMet : field.required || REQUIRED_DB_COLUMNS.includes(field.key);

    const value = values[field.key];
    const isEmpty = value === undefined || value === null || value === '';

    if (isRequired && isEmpty) {
      fieldErrors[field.key] = isConditional
        ? field.conditionalOn.message || `${field.label} is required`
        : `${field.label} is required`;
      return;
    }

    if (isEmpty) return;

    if (field.type === 'email' && !EMAIL_REGEX.test(value)) {
      fieldErrors[field.key] = 'Please enter a valid email address';
      return;
    }

    if (field.type === 'tel' && !PHONE_REGEX.test(value)) {
      fieldErrors[field.key] = `${field.label} must start with 0 or +233 and be followed by 9 digits`;
      return;
    }

    if (field.key === 'idNumber' && values.idType === 'Ghana Card') {
      if (!GHANA_CARD_ID_PATTERN.test(value)) {
        fieldErrors[field.key] = GHANA_CARD_ID_MESSAGE;
      }
      return;
    }

    if (field.validation?.pattern) {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          fieldErrors[field.key] = field.validation.message || `${field.label} is invalid`;
          return;
        }
      } catch {
        // malformed stored pattern — skip rather than 500
      }
    }

    if (field.validation?.minLength && value.length < field.validation.minLength) {
      fieldErrors[field.key] =
        field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`;
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const studentData = {};
  const customFields = {};

  fields.forEach((field) => {
    let value = values[field.key];
    if (value === undefined) return;

    if (field.key === 'emailAddress' && value) value = normalizeEmail(value);
    if (PHONE_TYPE_FIELDS.includes(field.key) && value) value = normalizePhone(value);

    if (BUILTIN_FIELD_KEYS.includes(field.key)) {
      studentData[field.key] = value === '' ? null : value;
    } else {
      customFields[field.key] = value;
    }
  });

  return { studentData, customFields };
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
  try {
    const fields = await loadActiveFormFields();
    const result = processDynamicFields(req.body, fields);

    if (result.fieldErrors) {
      const messages = Object.values(result.fieldErrors);
      return res.status(400).json({
        message: messages[0] || 'Please check the highlighted fields.',
        fieldErrors: result.fieldErrors,
      });
    }

    const { studentData, customFields } = result;

    const duplicates = await findDuplicateStudents({
      emailAddress: studentData.emailAddress,
      phoneNumber: studentData.phoneNumber,
    });

    if (duplicates.length > 0) {
      return res.status(409).json(buildDuplicatePayload(duplicates, studentData.emailAddress, studentData.phoneNumber));
    }

    const student = await prisma.student.create({
      data: {
        ...studentData,
        courseId: await resolveCourseId(studentData.courseTitle),
        customFields: Object.keys(customFields).length ? customFields : undefined,
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
  const { q, admissionStatus, courseCategory, computerLiteracy, location } = req.query;

  const where = {};

  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { emailAddress: { contains: q } },
      { phoneNumber: { contains: q } },
      { courseCategory: { contains: q } },
    ];
  }

  if (admissionStatus) where.admissionStatus = admissionStatus;
  if (courseCategory) where.courseCategory = courseCategory;
  if (computerLiteracy) where.computerLiteracy = computerLiteracy;
  if (location) where.customFields = { path: ['center-location'], equals: location };

  try {
    const students = await prisma.student.findMany({
      where: Object.keys(where).length ? where : undefined,
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

  try {
    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Student not found' });

    const fields = await loadActiveFormFields();
    const result = processDynamicFields(req.body, fields);

    if (result.fieldErrors) {
      const messages = Object.values(result.fieldErrors);
      return res.status(400).json({
        message: messages[0] || 'Please check the highlighted fields.',
        fieldErrors: result.fieldErrors,
      });
    }

    const { studentData, customFields } = result;

    const duplicates = await findDuplicateStudents({
      emailAddress: studentData.emailAddress,
      phoneNumber: studentData.phoneNumber,
      excludeId: id,
    });

    if (duplicates.length > 0) {
      return res.status(409).json(buildDuplicatePayload(duplicates, studentData.emailAddress, studentData.phoneNumber));
    }

    const mergedCustomFields = { ...(existing.customFields || {}), ...customFields };

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...studentData,
        ...(studentData.courseTitle !== undefined
          ? { courseId: await resolveCourseId(studentData.courseTitle) }
          : {}),
        customFields: Object.keys(mergedCustomFields).length ? mergedCustomFields : null,
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

const bulkDeleteStudents = async (req, res) => {
  const ids = parseIds(req.body.ids);
  if (!ids) return res.status(400).json({ message: 'ids must be a non-empty array of student IDs' });

  try {
    const result = await prisma.student.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: 'Students deleted', deleted: result.count });
  } catch (error) {
    console.error('Bulk delete students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
};
