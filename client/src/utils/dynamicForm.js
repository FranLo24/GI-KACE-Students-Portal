import { z } from 'zod';

const PHONE_REGEX = /^(?:0|\+233)\d{9}$/;

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

  if (field.validation?.pattern) {
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
