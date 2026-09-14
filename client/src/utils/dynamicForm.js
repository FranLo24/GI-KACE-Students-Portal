import { z } from 'zod';

const PHONE_REGEX = /^(?:0|\+233)\d{9}$/;

// Ghana Card numbers follow a fixed GHA-XXXXXXXXX-X format (9 digits then a
// check digit) regardless of whatever pattern an admin has configured for
// the generic ID Number field — enforced only when ID Type is "Ghana Card".
const GHANA_CARD_ID_PATTERN = /^GHA-\d{9}-\d$/;
const GHANA_CARD_ID_MESSAGE = 'ID Number must be in the format GHA-XXXXXXXXX-X';

export function sortByOrder(items = []) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function isFieldVisible(field, values) {
  if (!field.conditionalOn) return true;
  return values?.[field.conditionalOn.field] === field.conditionalOn.value;
}

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
);

function baseStringSchema(field) {
  let schema = z.string().trim().min(1, `${field.label} is required`);

  if (field.type === 'email') {
    schema = schema.email('Please enter a valid email address');
  }

  if (field.type === 'tel') {
    schema = schema.regex(PHONE_REGEX, `${field.label} must start with 0 or +233 and be followed by 9 digits`);
  }

  // idNumber's pattern is conditional on idType (see the superRefine pass
  // below for the Ghana Card case), so it's validated there instead.
  if (field.validation?.pattern && field.key !== 'idNumber') {
    schema = schema.regex(new RegExp(field.validation.pattern), field.validation.message || `${field.label} is invalid`);
  }

  if (field.validation?.minLength) {
    schema = schema.min(
      field.validation.minLength,
      field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`,
    );
  }

  if (field.validation?.maxLength) {
    schema = schema.max(
      field.validation.maxLength,
      field.validation.message || `${field.label} must be at most ${field.validation.maxLength} characters`,
    );
  }

  return schema;
}

function fieldSchema(field) {
  if (field.type === 'checkbox') {
    return field.required && !field.conditionalOn
      ? z.boolean().refine((value) => value === true, `${field.label} is required`)
      : z.boolean().optional().default(false);
  }

  if (field.required && !field.conditionalOn) {
    return baseStringSchema(field);
  }

  return optionalTrimmedString;
}

// Builds a Zod schema at runtime from the admin-configured fields, mirroring
// what registrationSchema.js used to hardcode: required-presence + type-aware
// checks (email/phone regex) in the base shape, plus a superRefine pass for
// checks that only apply when a value is present (optional tel/pattern) or
// that depend on another field's value (conditionalOn "Other" sub-fields).
export function buildZodSchema(sections) {
  const fields = sections.flatMap((section) => section.fields || []);
  const shape = {};
  fields.forEach((field) => {
    shape[field.key] = fieldSchema(field);
  });

  return z.object(shape).superRefine((data, ctx) => {
    fields.forEach((field) => {
      const value = data[field.key];

      if (field.key === 'idNumber' && value) {
        if (data.idType === 'Ghana Card') {
          if (!GHANA_CARD_ID_PATTERN.test(value)) {
            ctx.addIssue({ code: 'custom', message: GHANA_CARD_ID_MESSAGE, path: ['idNumber'] });
          }
        } else if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: field.validation.message || `${field.label} is invalid`,
            path: ['idNumber'],
          });
        }
        return;
      }

      if (field.conditionalOn) {
        const conditionMet = data[field.conditionalOn.field] === field.conditionalOn.value;
        if (conditionMet && !value?.toString().trim()) {
          ctx.addIssue({
            code: 'custom',
            message: field.conditionalOn.message || `Please specify ${field.label.toLowerCase()}`,
            path: [field.key],
          });
        }
        return;
      }

      if (field.required || field.type === 'checkbox' || !value) {
        return;
      }

      if (field.type === 'tel' && !PHONE_REGEX.test(value)) {
        ctx.addIssue({
          code: 'custom',
          message: `${field.label} must start with 0 or +233 and be followed by 9 digits`,
          path: [field.key],
        });
        return;
      }

      if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
        ctx.addIssue({
          code: 'custom',
          message: field.validation.message || `${field.label} is invalid`,
          path: [field.key],
        });
      }
    });
  });
}

export function getDefaultValues(sections) {
  const fields = sections.flatMap((section) => section.fields || []);
  const defaults = {};
  fields.forEach((field) => {
    defaults[field.key] = field.type === 'checkbox' ? false : '';
  });
  return defaults;
}

// The registration form's "Full Name" field is a single required Student
// column (see server/src/data/builtinFieldKeys.js), but an admin can split it
// into separate First/Last/Other Names fields via the form builder — the
// extra parts land as custom fields alongside the original fullName value.
// This locates all of those name parts (in display order) so callers can
// reassemble the full name instead of showing only the first part.
export function getPersonalNameFields(sections = []) {
  const section = sections.find((s) => (s.fields || []).some((field) => field.key === 'fullName'));
  if (!section) return [];

  return sortByOrder(section.fields || []).filter(
    (field) => field.key === 'fullName' || /\b(last|other)\s*names?\b/i.test(field.label || ''),
  );
}

export function getStudentDisplayName(student, sections = []) {
  const nameFields = getPersonalNameFields(sections);
  if (nameFields.length <= 1) return student.fullName;

  const assembled = nameFields
    .map((field) => (field.isBuiltIn ? student[field.key] : student.customFields?.[field.key]))
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .join(' ');

  return assembled || student.fullName;
}
