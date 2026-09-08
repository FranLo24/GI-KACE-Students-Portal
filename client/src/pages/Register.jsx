import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import CourseFeeList from '../components/CourseFeeList';
import api from '../api/axios';
import { buildZodSchema, getDefaultValues, isFieldVisible, sortByOrder } from '../utils/dynamicForm';
import { useCourses } from '../hooks/useCourses';
import registerHero from '../assets/register-hero.png';

function FieldLabel({ children, optional = false }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}{' '}
      {optional ? (
        <span className="font-normal text-slate-400">(optional)</span>
      ) : (
        <span className="text-blue-500">*</span>
      )}
    </label>
  );
}

function ErrorMsg({ error }) {
  return error ? (
    <p role="alert" className="mt-2 text-xs font-medium text-red-600">
      {error.message}
    </p>
  ) : null;
}

function SectionCard({ number, title, description, children, sectionRef, headingStyle }) {
  return (
    <section ref={sectionRef} className="portal-panel p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Section {number}</p>
          <h2 style={headingStyle} className="mt-2 text-2xl font-semibold text-slate-900">
            {title}
          </h2>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function getInputClass(error) {
  return [
    'portal-input',
    error ? 'border-red-300 bg-red-50/80 focus:border-red-400 focus:ring-red-100' : '',
  ].join(' ');
}

function getChipClass(selected) {
  return [
    'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition duration-300',
    selected
      ? 'border-transparent bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/60'
      : 'border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200 hover:text-blue-700',
  ].join(' ');
}

// Text/email/tel/number/date/textarea/select/radio/checkbox — every field
// type an admin can create — rendered generically from its FormField
// definition. The one section with a bespoke widget (the course-card picker)
// is special-cased in RegistrationForm and never reaches this renderer.
function DynamicField({ field, register, errors, values }) {
  if (!isFieldVisible(field, values)) return null;

  const error = errors[field.key];
  const optional = !field.required && !field.conditionalOn;

  if (field.type === 'textarea') {
    return (
      <div key={field.key} className="md:col-span-2">
        <FieldLabel optional={optional}>{field.label}</FieldLabel>
        <textarea
          {...register(field.key)}
          rows={4}
          className="portal-textarea"
          placeholder={field.placeholder || ''}
        />
        <ErrorMsg error={error} />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div key={field.key} className="md:col-span-2">
        <FieldLabel optional={optional}>{field.label}</FieldLabel>
        <select {...register(field.key)} className="portal-select">
          <option value="">Select…</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ErrorMsg error={error} />
      </div>
    );
  }

  if (field.type === 'radio') {
    const current = values[field.key];
    return (
      <div key={field.key} className="md:col-span-2">
        <FieldLabel optional={optional}>{field.label}</FieldLabel>
        <div className="flex flex-wrap gap-3">
          {(field.options || []).map((option) => (
            <label key={option} className={getChipClass(current === option)}>
              <input type="radio" value={option} {...register(field.key)} className="sr-only" />
              {option}
            </label>
          ))}
        </div>
        <ErrorMsg error={error} />
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div key={field.key} className="flex items-center gap-3 md:col-span-2">
        <input type="checkbox" {...register(field.key)} className="h-5 w-5 rounded border-slate-300 text-blue-600" />
        <FieldLabel optional={optional}>{field.label}</FieldLabel>
      </div>
    );
  }

  const inputType = ['email', 'tel', 'number', 'date'].includes(field.type) ? field.type : 'text';

  return (
    <div key={field.key}>
      <FieldLabel optional={optional}>{field.label}</FieldLabel>
      <input
        type={inputType}
        {...register(field.key)}
        inputMode={inputType === 'tel' ? 'numeric' : undefined}
        maxLength={inputType === 'tel' ? 13 : undefined}
        className={getInputClass(error)}
        placeholder={field.placeholder || ''}
      />
      <ErrorMsg error={error} />
    </div>
  );
}

function RegistrationForm({ sections, headingScale }) {
  const [modal, setModal] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [courseLevels, setCourseLevels] = useState([]);
  const { courses: featuredCourses } = useCourses();
  const ictSkillsSectionRef = useRef(null);
  const emergencyContactSectionRef = useRef(null);

  useEffect(() => {
    api
      .get('/course-levels')
      .then((res) => setCourseLevels(res.data))
      .catch(() => {});
  }, []);

  const schema = buildZodSchema(sections);
  const defaultValues = getDefaultValues(sections);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const values = useWatch({ control }) || {};
  const computerLiteracy = values.computerLiteracy;
  const courseCategory = values.courseCategory;
  const courseTitle = values.courseTitle;
  const centerLocation = values['center-location'];

  const levelByCategory = new Map(courseLevels.map((entry) => [entry.category, entry.level]));
  const visibleCourses = featuredCourses.filter((course) => levelByCategory.get(course.category) === computerLiteracy);

  const onSubmit = (data) => {
    clearErrors(['emailAddress', 'phoneNumber']);
    setPendingData(data);
    setModal({ type: 'confirm' });
  };

  const handleConfirm = async () => {
    setModal(null);
    setSubmitting(true);
    try {
      await api.post('/register', pendingData);
      setModal({ type: 'success', name: pendingData.fullName });
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
      }

      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setModal({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setModal(null);
    reset();
  };

  const scrollToIctSkillsSection = () => {
    ictSkillsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToEmergencyContactSection = () => {
    emergencyContactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectCourse = (course) => {
    setValue('courseCategory', course.category, { shouldDirty: true, shouldValidate: true });
    setValue('courseTitle', course.title, { shouldDirty: true, shouldValidate: true });
    setValue('courseCategoryOther', '', { shouldDirty: true, shouldValidate: true });
    window.requestAnimationFrame(scrollToEmergencyContactSection);
  };

  const selectCustomCourse = () => {
    setValue('courseCategory', 'Other', { shouldDirty: true, shouldValidate: true });
    setValue('courseTitle', '', { shouldDirty: true, shouldValidate: true });
    setValue('courseCategoryOther', '', { shouldDirty: true, shouldValidate: true });
  };

  const headingStyle =
    headingScale && headingScale !== 1 ? { fontSize: `calc(1.5rem * ${headingScale})` } : undefined;

  const sectionRefFor = (key) => {
    if (key === 'ict-skills-experience') return ictSkillsSectionRef;
    if (key === 'emergency-contact') return emergencyContactSectionRef;
    return undefined;
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 space-y-8">
        {sections.map((section, index) => {
          const fields = sortByOrder(section.fields || []);

          if (section.key === 'course-details') {
            return (
              <SectionCard
                key={section.key}
                number={index + 1}
                title={section.title}
                description={section.description}
                headingStyle={headingStyle}
              >
                <input type="hidden" {...register('courseCategory')} />

                {!computerLiteracy ? (
                  <div className="portal-data-card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Level required</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Select your computer literacy level in the ICT Skills &amp; Experience section above to see courses for that level.
                      </p>
                    </div>
                    <button type="button" onClick={scrollToIctSkillsSection} className="portal-button-secondary shrink-0">
                      Go to ICT Skills
                    </button>
                  </div>
                ) : (
                  <>
                    {visibleCourses.length === 0 ? (
                      <div className="portal-data-card mb-5">
                        <p className="text-sm text-slate-600">
                          No courses are currently listed for the <strong>{computerLiteracy}</strong> level. You can still choose a custom programme below.
                        </p>
                      </div>
                    ) : null}

                    <div className="grid gap-5 xl:grid-cols-3">
                      {visibleCourses.map((course) => {
                        const selected = courseCategory === course.category;
                        return (
                          <button
                            key={course.title}
                            type="button"
                            onClick={() => selectCourse(course)}
                            className={[
                              'group relative overflow-hidden rounded-[24px] border text-left transition duration-300',
                              selected
                                ? 'border-[#422be4] bg-gradient-to-r from-[#422be4] via-blue-500 to-blue-600 text-white shadow-[0_22px_70px_rgba(66,43,228,0.24)]'
                                : 'border-slate-200 bg-white hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]',
                            ].join(' ')}
                          >
                            {course.imageUrl && (
                              <img src={course.imageUrl} alt={course.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                            )}
                            <div className="space-y-3 p-5">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className={[selected ? 'text-white' : 'text-slate-900', 'text-lg font-semibold'].join(' ')}>{course.title}</h3>
                              </div>
                              <p className={selected ? 'text-sm text-white/90' : 'text-sm text-slate-600'}>{course.description}</p>
                              <p className={selected ? 'text-xs font-medium uppercase tracking-[0.2em] text-white/80' : 'text-xs font-medium uppercase tracking-[0.2em] text-blue-700'}>{course.outcomes}</p>
                              <CourseFeeList
                                fees={course.locationFees}
                                selectedLocation={centerLocation}
                                variant={selected ? 'dark' : 'light'}
                              />
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={selectCustomCourse}
                        className={[
                          'flex min-h-[320px] flex-col justify-between rounded-[24px] border p-6 text-left transition duration-300',
                          courseCategory === 'Other'
                            ? 'border-[#422be4] bg-gradient-to-r from-[#422be4] via-blue-500 to-blue-600 text-white shadow-[0_22px_70px_rgba(66,43,228,0.24)]'
                            : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]',
                        ].join(' ')}
                      >
                        <div>
                          <span className={courseCategory === 'Other' ? 'inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white' : 'portal-kicker'}>
                            Custom request
                          </span>
                          <h3 className={courseCategory === 'Other' ? 'mt-4 text-2xl font-semibold text-white' : 'mt-4 text-2xl font-semibold text-slate-900'}>Other programme</h3>
                          <p className={courseCategory === 'Other' ? 'mt-3 text-sm text-white/90' : 'mt-3 text-sm text-slate-600'}>
                            Choose this if you want a custom or not-yet-listed training option.
                          </p>
                        </div>
                        <p className={courseCategory === 'Other' ? 'text-xs font-medium uppercase tracking-[0.2em] text-white/80' : 'text-xs font-medium uppercase tracking-[0.2em] text-blue-700'}>Flexible course selection</p>
                      </button>
                    </div>

                    <ErrorMsg error={errors.courseCategory} />

                    {courseCategory === 'Other' ? (
                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div>
                          <FieldLabel>Course Title</FieldLabel>
                          <input {...register('courseTitle')} className={getInputClass(errors.courseTitle)} placeholder="Selected course title or a custom title" />
                          <ErrorMsg error={errors.courseTitle} />
                        </div>

                        <div>
                          <FieldLabel>Course Category</FieldLabel>
                          <input {...register('courseCategoryOther')} className={getInputClass(errors.courseCategoryOther)} placeholder="Please specify the course category" />
                          <ErrorMsg error={errors.courseCategoryOther} />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <div className="portal-data-card flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Current selection</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">{courseTitle || 'Choose a course card'}</p>
                            <p className="mt-1 text-sm text-slate-500">{courseCategory || 'No category selected yet'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </SectionCard>
            );
          }

          return (
            <SectionCard
              key={section.key}
              number={index + 1}
              title={section.title}
              description={section.description}
              sectionRef={sectionRefFor(section.key)}
              headingStyle={headingStyle}
            >
              <div className="grid gap-5 md:grid-cols-2">
                {fields.map((field) => (
                  <DynamicField key={field.key} field={field} register={register} errors={errors} values={values} />
                ))}
              </div>
            </SectionCard>
          );
        })}

        <div className="glass-panel flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Submission</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Fields marked with * are required.</p>
            <p className="mt-1 text-sm text-slate-500">Review your information, then confirm your registration in the next step.</p>
          </div>
          <button type="submit" disabled={submitting} className="portal-button-primary min-w-[220px]">
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>

      {modal?.type === 'confirm' ? (
        <Modal
          title="Confirm Registration"
          message="Are you sure you want to submit your registration? Please review your details before confirming."
          showCancel
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal?.type === 'success' ? (
        <Modal
          title="Registration Successful!"
          message={'Welcome, ' + modal.name + '! Your registration has been submitted successfully. Our admissions team will review it and contact you about admission.'}
          onClose={handleSuccessClose}
        />
      ) : null}

      {modal?.type === 'error' ? (
        <Modal title="Registration Failed" message={modal.message} onClose={() => setModal(null)} />
      ) : null}
    </>
  );
}

export default function Register() {
  const [formConfig, setFormConfig] = useState(null);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    api
      .get('/form-config')
      .then((res) => setFormConfig(res.data))
      .catch(() => setConfigError('Failed to load the registration form. Please refresh the page.'));
  }, []);

  useEffect(() => {
    const settings = formConfig?.settings;
    if (!settings) return undefined;

    const root = document.documentElement;
    const previousFontSize = root.style.fontSize;
    const previousFontFamily = root.style.getPropertyValue('--portal-font-family');

    if (settings.fontFamily) {
      root.style.setProperty('--portal-font-family', settings.fontFamily);
    }
    if (settings.baseFontSize) {
      root.style.fontSize = `${settings.baseFontSize}px`;
    }

    return () => {
      root.style.fontSize = previousFontSize;
      if (previousFontFamily) {
        root.style.setProperty('--portal-font-family', previousFontFamily);
      } else {
        root.style.removeProperty('--portal-font-family');
      }
    };
  }, [formConfig?.settings]);

  const settings = formConfig?.settings;
  const heroImage = settings?.heroImageUrl || registerHero;
  const headingScale = settings?.headingScale;
  const heroHeadingStyle = headingScale && headingScale !== 1 ? { fontSize: `calc(3rem * ${headingScale})` } : undefined;
  const sections = formConfig?.sections ? sortByOrder(formConfig.sections) : null;

  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <Navbar />

      <main className="portal-container flex-1 py-8 pb-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-rise-in space-y-6">
            <span className="portal-kicker">Student registration</span>
            <div className="space-y-4">
              <h1 style={heroHeadingStyle} className="text-5xl font-semibold leading-tight md:text-6xl">
                Register through a portal that feels <span className="portal-gradient-text">clear, guided, and easy to use</span>.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Complete your application in organised sections, choose a programme that fits your goals, and submit your registration with confidence.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="portal-data-card">
                <p className="text-sm font-semibold text-slate-900">Programme selection</p>
                <p className="mt-1 text-sm text-slate-500">Review course options and choose the path that matches your interests.</p>
              </div>
              <div className="portal-data-card">
                <p className="text-sm font-semibold text-slate-900">Structured application</p>
                <p className="mt-1 text-sm text-slate-500">Each section groups related details so you can complete the form accurately.</p>
              </div>
              <div className="portal-data-card">
                <p className="text-sm font-semibold text-slate-900">Confident submission</p>
                <p className="mt-1 text-sm text-slate-500">Review your information before sending your registration for processing.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel animate-float-soft overflow-hidden p-3">
            <img
              src={heroImage}
              alt="Prospective students in an ICT registration environment"
              className="h-[420px] w-full rounded-[24px] object-cover"
            />
          </div>
        </section>

        {configError ? (
          <div className="portal-panel mt-10 p-6 text-sm text-red-600">{configError}</div>
        ) : !sections ? (
          <div className="portal-panel mt-10 p-6 text-sm text-slate-500">Loading registration form…</div>
        ) : (
          <RegistrationForm sections={sections} headingScale={headingScale} />
        )}
      </main>

      <Footer />
    </div>
  );
}
