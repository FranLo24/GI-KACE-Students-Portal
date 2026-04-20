import { z } from 'zod';

const phoneRegex = /^\d{10,15}$/;

export const registrationSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    gender: z.string().min(1, 'Please select a gender'),
    nationality: z.string().min(1, 'Nationality is required'),
    idType: z.string().min(1, 'Please select an ID type'),
    idTypeOther: z.string().optional(),
    idNumber: z.string().min(1, 'ID number is required'),

    phoneNumber: z.string().regex(phoneRegex, 'Phone number must be 10–15 digits'),
    alternativePhone: z.string().optional(),
    emailAddress: z.string().email('Please enter a valid email address'),
    residentialAddress: z.string().min(1, 'Residential address is required'),
    cityTown: z.string().min(1, 'City/Town is required'),

    highestEducation: z.string().min(1, 'Please select your highest education level'),
    highestEducationOther: z.string().optional(),
    fieldOfStudy: z.string().min(1, 'Field of study is required'),

    employmentStatus: z.string().min(1, 'Please select employment status'),
    organizationName: z.string().optional(),
    jobTitle: z.string().optional(),
    yearsOfExperience: z.string().optional(),

    courseTitle: z.string().min(1, 'Course title is required'),
    courseCategory: z.string().min(1, 'Please select a course category'),
    courseCategoryOther: z.string().optional(),

    computerLiteracy: z.string().min(1, 'Please select your computer literacy level'),
    relevantSkills: z.string().optional(),

    emergencyName: z.string().min(1, 'Emergency contact name is required'),
    emergencyRelationship: z.string().min(1, 'Relationship is required'),
    emergencyPhone: z.string().regex(phoneRegex, 'Emergency phone must be 10–15 digits'),
  })
  .superRefine((data, ctx) => {
    if (data.alternativePhone && !phoneRegex.test(data.alternativePhone)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Alternative phone must be 10–15 digits',
        path: ['alternativePhone'],
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
