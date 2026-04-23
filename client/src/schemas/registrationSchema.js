import { z } from 'zod';

const phoneRegex = /^(?:0|\+233)\d{9}$/;
const textRegex = /^[A-Za-z][A-Za-z\s.'-]*$/;
const idNumberRegex = /^[A-Za-z0-9/-]{8,13}$/;
const experienceRegex = /^(?:[0-9]|[1-4][0-9]|50)$/;

const requiredText = (message) => z.string().trim().min(1, message);
const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
);

export const registrationSchema = z
  .object({
    fullName: requiredText('Full name is required').regex(
      textRegex,
      'Full name can only include letters, spaces, apostrophes, periods, and hyphens',
    ),
    gender: z.string().min(1, 'Please select a gender'),
    nationality: requiredText('Nationality is required').regex(
      textRegex,
      'Nationality can only include letters, spaces, apostrophes, periods, and hyphens',
    ),
    idType: z.string().min(1, 'Please select an ID type'),
    idTypeOther: optionalTrimmedString,
    idNumber: requiredText('ID number is required').regex(
      idNumberRegex,
      'ID number can only include letters, numbers, and hyphens and should be a minimum of 8 and a maximum of 13 characters',
    ),

    phoneNumber: requiredText('Phone number is required').regex(
      phoneRegex,
      'Phone number must start with 0 or +233 and be followed by 9 digits',
    ),
    alternativePhone: optionalTrimmedString,
    emailAddress: requiredText('Email address is required').email('Please enter a valid email address'),
    residentialAddress: requiredText('Residential address is required').min(5, 'Residential address must be at least 5 characters'),
    cityTown: requiredText('City/Town is required').regex(
      textRegex,
      'City/Town can only include letters, spaces, apostrophes, periods, and hyphens',
    ),

    highestEducation: z.string().min(1, 'Please select your highest education level'),
    highestEducationOther: optionalTrimmedString,
    fieldOfStudy: requiredText('Field of study is required').min(2, 'Field of study must be at least 2 characters'),

    employmentStatus: z.string().min(1, 'Please select employment status'),
    organizationName: optionalTrimmedString,
    jobTitle: optionalTrimmedString,
    yearsOfExperience: optionalTrimmedString,

    courseTitle: requiredText('Course title is required').min(2, 'Course title must be at least 2 characters'),
    courseCategory: z.string().min(1, 'Please select a course category'),
    courseCategoryOther: optionalTrimmedString,

    computerLiteracy: z.string().min(1, 'Please select your computer literacy level'),
    relevantSkills: optionalTrimmedString,

    emergencyName: requiredText('Emergency contact name is required').regex(
      textRegex,
      'Emergency contact name can only include letters, spaces, apostrophes, periods, and hyphens',
    ),
    emergencyRelationship: requiredText('Relationship is required').regex(
      textRegex,
      'Relationship can only include letters, spaces, apostrophes, periods, and hyphens',
    ),
    emergencyPhone: requiredText('Emergency phone is required').regex(
      phoneRegex,
      'Emergency phone must start with 0 or +233 and be followed by 9 digits',
    ),
  })
  .superRefine((data, ctx) => {
    if (data.alternativePhone && !phoneRegex.test(data.alternativePhone)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Alternative phone must start with 0 or +233 and be followed by 9 digits',
        path: ['alternativePhone'],
      });
    }

    if (data.yearsOfExperience && !experienceRegex.test(data.yearsOfExperience)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Years of experience must be a whole number from 0 to 50',
        path: ['yearsOfExperience'],
      });
    }

    if (data.idType === 'Other' && !data.idTypeOther?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify the ID type',
        path: ['idTypeOther'],
      });
    }

    if (data.highestEducation === 'Other' && !data.highestEducationOther?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify your education level',
        path: ['highestEducationOther'],
      });
    }

    if (data.courseCategory === 'Other' && !data.courseCategoryOther?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify the course category',
        path: ['courseCategoryOther'],
      });
    }
  });