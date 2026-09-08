// One-time seed that mirrors the registration form's previous hardcoded
// sections/fields into the FormSection/FormField tables, plus a default
// FormSettings row — so the public form renders identically after migrating
// onto the dynamic form-builder, before any admin makes changes.
const { PrismaClient } = require('@prisma/client');
const { featuredCourses } = require('./seedFormConfig.data');

const prisma = new PrismaClient();

const TEXT_PATTERN = "^[A-Za-z][A-Za-z\\s.'-]*$";
const TEXT_MESSAGE = 'Can only include letters, spaces, apostrophes, periods, and hyphens';
const ID_NUMBER_PATTERN = '^[A-Za-z0-9/-]{8,13}$';
const EXPERIENCE_PATTERN = '^(?:[0-9]|[1-4][0-9]|50)$';

const courseCategoryOptions = [...featuredCourses.map((course) => course.category), 'Other'];

const SECTIONS = [
  {
    key: 'personal-information',
    title: 'Personal Information',
    description: 'Provide your basic details so we can identify you correctly during registration.',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true, validation: { pattern: TEXT_PATTERN, message: TEXT_MESSAGE } },
      { key: 'gender', label: 'Gender', type: 'radio', required: true, options: ['Male', 'Female'] },
      { key: 'nationality', label: 'Nationality', type: 'text', required: true, validation: { pattern: TEXT_PATTERN, message: TEXT_MESSAGE } },
      { key: 'idType', label: 'ID Type', type: 'radio', required: true, options: ['Ghana Card', 'Passport', 'Other'] },
      { key: 'idNumber', label: 'ID Number', type: 'text', required: true, validation: { pattern: ID_NUMBER_PATTERN, message: 'Can only include letters, numbers, and hyphens, 8-13 characters' } },
      { key: 'idTypeOther', label: 'ID Type (Other)', type: 'text', required: false, conditionalOn: { field: 'idType', value: 'Other', message: 'Please specify the ID type' } },
    ],
  },
  {
    key: 'contact-information',
    title: 'Contact Information',
    description: 'Share the best contact details for updates, notifications, and follow-up communication.',
    fields: [
      { key: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
      { key: 'alternativePhone', label: 'Alternative Phone', type: 'tel', required: false },
      { key: 'emailAddress', label: 'Email Address', type: 'email', required: true },
      { key: 'cityTown', label: 'City / Town', type: 'text', required: true, validation: { pattern: TEXT_PATTERN, message: TEXT_MESSAGE } },
      { key: 'residentialAddress', label: 'Residential Address', type: 'text', required: true, validation: { minLength: 5, message: 'Residential address must be at least 5 characters' } },
    ],
  },
  {
    key: 'educational-background',
    title: 'Educational Background',
    description: 'Tell us about your academic background so we can better understand your starting point.',
    fields: [
      { key: 'highestEducation', label: 'Highest Education', type: 'radio', required: true, options: ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Other'] },
      { key: 'highestEducationOther', label: 'Education (Other)', type: 'text', required: false, conditionalOn: { field: 'highestEducation', value: 'Other', message: 'Please specify your education level' } },
      { key: 'fieldOfStudy', label: 'Field of Study', type: 'text', required: true, validation: { minLength: 2, message: 'Field of study must be at least 2 characters' } },
    ],
  },
  {
    key: 'employment-information',
    title: 'Employment Information',
    description: 'Share your current work situation so we can understand the context of your learning goals.',
    fields: [
      { key: 'employmentStatus', label: 'Employment Status', type: 'radio', required: true, options: ['Employed', 'Self-Employed', 'Unemployed', 'Student'] },
      { key: 'organizationName', label: 'Organization Name', type: 'text', required: false },
      { key: 'jobTitle', label: 'Job Title', type: 'text', required: false },
      { key: 'yearsOfExperience', label: 'Years of Experience', type: 'number', required: false, validation: { pattern: EXPERIENCE_PATTERN, message: 'Years of experience must be a whole number from 0 to 50' } },
    ],
  },
  {
    key: 'ict-skills-experience',
    title: 'ICT Skills & Experience',
    description: 'Let us know your computer literacy level and any practical experience relevant to the course.',
    fields: [
      { key: 'computerLiteracy', label: 'Computer Literacy', type: 'radio', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
      { key: 'relevantSkills', label: 'Relevant Skills', type: 'textarea', required: false },
    ],
  },
  {
    key: 'course-details',
    title: 'Course Details',
    description: 'Choose the programme you want to study, then confirm the exact course title for your application.',
    fields: [
      { key: 'courseCategory', label: 'Course Category', type: 'select', required: true, options: courseCategoryOptions },
      { key: 'courseTitle', label: 'Course Title', type: 'text', required: true, validation: { minLength: 2, message: 'Course title must be at least 2 characters' } },
      { key: 'courseCategoryOther', label: 'Course Category (Other)', type: 'text', required: false, conditionalOn: { field: 'courseCategory', value: 'Other', message: 'Please specify the course category' } },
    ],
  },
  {
    key: 'emergency-contact',
    title: 'Emergency Contact',
    description: 'Add a reliable contact person we can reach in case of an urgent follow-up.',
    fields: [
      { key: 'emergencyName', label: 'Emergency Contact Name', type: 'text', required: true, validation: { pattern: TEXT_PATTERN, message: TEXT_MESSAGE } },
      { key: 'emergencyRelationship', label: 'Relationship', type: 'text', required: true, validation: { pattern: TEXT_PATTERN, message: TEXT_MESSAGE } },
      { key: 'emergencyPhone', label: 'Emergency Phone', type: 'tel', required: true },
    ],
  },
];

async function main() {
  for (let sectionIndex = 0; sectionIndex < SECTIONS.length; sectionIndex++) {
    const { key, title, description, fields } = SECTIONS[sectionIndex];

    const section = await prisma.formSection.upsert({
      where: { key },
      update: {},
      create: { key, title, description, order: sectionIndex, enabled: true },
    });

    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
      const field = fields[fieldIndex];
      await prisma.formField.upsert({
        where: { key: field.key },
        update: {},
        create: {
          sectionId: section.id,
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options ?? undefined,
          validation: field.validation ?? undefined,
          conditionalOn: field.conditionalOn ?? undefined,
          order: fieldIndex,
          enabled: true,
          isBuiltIn: true,
        },
      });
    }
  }

  await prisma.formSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log('Form config seeded.');
}

main()
  .catch((error) => {
    console.error('Seed form config error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
