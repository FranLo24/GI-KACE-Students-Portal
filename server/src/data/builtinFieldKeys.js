// Student columns the registration form can address. Kept in sync with the
// scalar fields on the Student Prisma model (excluding id/timestamps/admission
// and attendance status, which are admin-managed, not form input).
const BUILTIN_FIELD_KEYS = [
  'fullName', 'gender', 'nationality', 'idType', 'idTypeOther', 'idNumber',
  'phoneNumber', 'alternativePhone', 'emailAddress', 'residentialAddress', 'cityTown',
  'highestEducation', 'highestEducationOther', 'fieldOfStudy',
  'employmentStatus', 'organizationName', 'jobTitle', 'yearsOfExperience',
  'courseTitle', 'courseCategory', 'courseCategoryOther',
  'computerLiteracy', 'relevantSkills',
  'emergencyName', 'emergencyRelationship', 'emergencyPhone',
];

// Subset of the above that are NOT NULL columns on Student — these must always
// be collected and validated on registration/update regardless of whether an
// admin has disabled the corresponding FormField, so the database write can
// never fail with a missing-required-column error.
const REQUIRED_DB_COLUMNS = [
  'fullName', 'gender', 'nationality', 'idType', 'idNumber',
  'phoneNumber', 'emailAddress', 'residentialAddress', 'cityTown',
  'highestEducation', 'fieldOfStudy', 'employmentStatus',
  'courseTitle', 'courseCategory', 'computerLiteracy',
  'emergencyName', 'emergencyRelationship', 'emergencyPhone',
];

module.exports = { BUILTIN_FIELD_KEYS, REQUIRED_DB_COLUMNS };
