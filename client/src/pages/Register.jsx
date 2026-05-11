import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import api from '../api/axios';
import { registrationSchema } from '../schemas/registrationSchema';
import registerHero from '../assets/register-hero.png';
import { featuredCourses } from '../data/courseCatalog';

const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'Other',
];

const EMPLOYMENT_STATUSES = ['Employed', 'Self-Employed', 'Unemployed', 'Student'];
const COMPUTER_LITERACY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

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

function SectionCard({ number, title, description, children, sectionRef }) {
  return (
    <section ref={sectionRef} className="portal-panel p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Section {number}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
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

export default function Register() {
  const [modal, setModal] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const ictSkillsSectionRef = useRef(null);

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
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      gender: '',
      nationality: '',
      idType: '',
      idTypeOther: '',
      idNumber: '',
      phoneNumber: '',
      alternativePhone: '',
      emailAddress: '',
      residentialAddress: '',
      cityTown: '',
      highestEducation: '',
      highestEducationOther: '',
      fieldOfStudy: '',
      employmentStatus: '',
      organizationName: '',
      jobTitle: '',
      yearsOfExperience: '',
      courseTitle: '',
      courseCategory: '',
      courseCategoryOther: '',
      computerLiteracy: '',
      relevantSkills: '',
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: '',
    },
  });

  const gender = useWatch({ control, name: 'gender' });
  const idType = useWatch({ control, name: 'idType' });
  const highestEducation = useWatch({ control, name: 'highestEducation' });
  const employmentStatus = useWatch({ control, name: 'employmentStatus' });
  const courseCategory = useWatch({ control, name: 'courseCategory' });
  const courseTitle = useWatch({ control, name: 'courseTitle' });
  const computerLiteracy = useWatch({ control, name: 'computerLiteracy' });

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

  const selectCourse = (course) => {
    setValue('courseCategory', course.category, { shouldDirty: true, shouldValidate: true });
    setValue('courseTitle', course.title, { shouldDirty: true, shouldValidate: true });
    setValue('courseCategoryOther', '', { shouldDirty: true, shouldValidate: true });
    window.requestAnimationFrame(scrollToIctSkillsSection);
  };

  const selectCustomCourse = () => {
    setValue('courseCategory', 'Other', { shouldDirty: true, shouldValidate: true });
    setValue('courseTitle', '', { shouldDirty: true, shouldValidate: true });
    setValue('courseCategoryOther', '', { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <Navbar />

      <main className="portal-container flex-1 py-8 pb-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-rise-in space-y-6">
            <span className="portal-kicker">Student registration</span>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
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
              src={registerHero}
              alt="Prospective students in an ICT registration environment"
              className="h-[420px] w-full rounded-[24px] object-cover"
            />
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 space-y-8">
          <SectionCard
            number={1}
            title="Personal Information"
            description="Provide your basic details so we can identify you correctly during registration."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Full Name</FieldLabel>
                <input
                  {...register('fullName')}
                  className={getInputClass(errors.fullName)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
                <ErrorMsg error={errors.fullName} />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Gender</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {['Male', 'Female'].map((option) => (
                    <label key={option} className={getChipClass(gender === option)}>
                      <input type="radio" value={option} {...register('gender')} className="sr-only" />
                      {option}
                    </label>
                  ))}
                </div>
                <ErrorMsg error={errors.gender} />
              </div>

              <div>
                <FieldLabel>Nationality</FieldLabel>
                <input
                  {...register('nationality')}
                  className={getInputClass(errors.nationality)}
                  placeholder="e.g. Ghanaian"
                  autoComplete="country-name"
                />
                <ErrorMsg error={errors.nationality} />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>ID Type</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {['Ghana Card', 'Passport', 'Other'].map((option) => (
                    <label key={option} className={getChipClass(idType === option)}>
                      <input type="radio" value={option} {...register('idType')} className="sr-only" />
                      {option}
                    </label>
                  ))}
                </div>
                <ErrorMsg error={errors.idType} />
              </div>

              <div>
                <FieldLabel>ID Number</FieldLabel>
                <input {...register('idNumber')} className={getInputClass(errors.idNumber)} placeholder="Enter your ID number" />
                <ErrorMsg error={errors.idNumber} />
              </div>

              {idType === 'Other' ? (
                <div className="md:col-span-2">
                  <FieldLabel>Please specify your ID type</FieldLabel>
                  <input {...register('idTypeOther')} className={getInputClass(errors.idTypeOther)} placeholder="Describe your ID type" />
                  <ErrorMsg error={errors.idTypeOther} />
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            number={2}
            title="Contact Information"
            description="Share the best contact details for updates, notifications, and follow-up communication."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={13}
                  autoComplete="tel"
                  className={getInputClass(errors.phoneNumber)}
                  placeholder="e.g. 0241234567 or +233241234567"
                />
                <ErrorMsg error={errors.phoneNumber} />
              </div>
              <div>
                <FieldLabel optional>Alternative Phone</FieldLabel>
                <input
                  {...register('alternativePhone')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={13}
                  autoComplete="tel-national"
                  className={getInputClass(errors.alternativePhone)}
                  placeholder="e.g. 0201234567 or +233201234567"
                />
                <ErrorMsg error={errors.alternativePhone} />
              </div>
              <div>
                <FieldLabel>Email Address</FieldLabel>
                <input
                  type="email"
                  {...register('emailAddress')}
                  autoComplete="email"
                  className={getInputClass(errors.emailAddress)}
                  placeholder="you@example.com"
                />
                <ErrorMsg error={errors.emailAddress} />
              </div>
              <div>
                <FieldLabel>City / Town</FieldLabel>
                <input
                  {...register('cityTown')}
                  className={getInputClass(errors.cityTown)}
                  placeholder="e.g. Accra"
                  autoComplete="address-level2"
                />
                <ErrorMsg error={errors.cityTown} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel>Residential Address</FieldLabel>
                <input
                  {...register('residentialAddress')}
                  className={getInputClass(errors.residentialAddress)}
                  placeholder="Enter your residential address"
                  autoComplete="street-address"
                />
                <ErrorMsg error={errors.residentialAddress} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number={3}
            title="Educational Background"
            description="Tell us about your academic background so we can better understand your starting point."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Highest Level of Education</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {EDUCATION_LEVELS.map((option) => (
                    <label key={option} className={getChipClass(highestEducation === option)}>
                      <input type="radio" value={option} {...register('highestEducation')} className="sr-only" />
                      {option}
                    </label>
                  ))}
                </div>
                <ErrorMsg error={errors.highestEducation} />
              </div>

              {highestEducation === 'Other' ? (
                <div className="md:col-span-2">
                  <FieldLabel>Please specify your education level</FieldLabel>
                  <input {...register('highestEducationOther')} className={getInputClass(errors.highestEducationOther)} placeholder="Describe your education level" />
                  <ErrorMsg error={errors.highestEducationOther} />
                </div>
              ) : null}

              <div className="md:col-span-2">
                <FieldLabel>Field of Study</FieldLabel>
                <input {...register('fieldOfStudy')} className={getInputClass(errors.fieldOfStudy)} placeholder="e.g. Computer Science, Business" />
                <ErrorMsg error={errors.fieldOfStudy} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number={4}
            title="Employment Information"
            description="Share your current work situation so we can understand the context of your learning goals."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Employment Status</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {EMPLOYMENT_STATUSES.map((option) => (
                    <label key={option} className={getChipClass(employmentStatus === option)}>
                      <input type="radio" value={option} {...register('employmentStatus')} className="sr-only" />
                      {option}
                    </label>
                  ))}
                </div>
                <ErrorMsg error={errors.employmentStatus} />
              </div>

              <div>
                <FieldLabel optional>Organization Name</FieldLabel>
                <input {...register('organizationName')} className={getInputClass(errors.organizationName)} placeholder="Enter your organization name" />
              </div>
              <div>
                <FieldLabel optional>Job Title</FieldLabel>
                <input {...register('jobTitle')} className={getInputClass(errors.jobTitle)} placeholder="Enter your job title" />
              </div>
              <div className="md:col-span-2">
                <FieldLabel optional>Years of Experience</FieldLabel>
                <input
                  {...register('yearsOfExperience')}
                  inputMode="numeric"
                  maxLength={2}
                  className={getInputClass(errors.yearsOfExperience)}
                  placeholder="e.g. 3"
                />
                <ErrorMsg error={errors.yearsOfExperience} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number={5}
            title="Course Details"
            description="Choose the programme you want to study, then confirm the exact course title for your application."
          >
            <input type="hidden" {...register('courseCategory')} />
            <div className="grid gap-5 xl:grid-cols-3">
              {featuredCourses.map((course) => {
                const selected = courseCategory === course.category;
                return (
                  <button
                    key={course.title}
                    type="button"
                    onClick={() => selectCourse(course)}
                    className={[
                      'group overflow-hidden rounded-[24px] border text-left transition duration-300',
                      selected
                        ? 'border-[#422be4] bg-gradient-to-r from-[#422be4] via-blue-500 to-blue-600 text-white shadow-[0_22px_70px_rgba(66,43,228,0.24)]'
                        : 'border-slate-200 bg-white hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]',
                    ].join(' ')}
                  >
                    <img src={course.image} alt={course.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={[selected ? 'text-white' : 'text-slate-900', 'text-lg font-semibold'].join(' ')}>{course.title}</h3>
                        {/* <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                          {course.spotlight}
                        </span> */}
                      </div>
                      <p className={selected ? 'text-sm text-white/90' : 'text-sm text-slate-600'}>{course.description}</p>
                      <p className={selected ? 'text-xs font-medium uppercase tracking-[0.2em] text-white/80' : 'text-xs font-medium uppercase tracking-[0.2em] text-blue-700'}>{course.outcomes}</p>
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
          </SectionCard>

          <SectionCard
            number={6}
            title="ICT Skills & Experience"
            description="Let us know your computer literacy level and any practical experience relevant to the course."
            sectionRef={ictSkillsSectionRef}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Level of Computer Literacy</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {COMPUTER_LITERACY_LEVELS.map((option) => (
                    <label key={option} className={getChipClass(computerLiteracy === option)}>
                      <input type="radio" value={option} {...register('computerLiteracy')} className="sr-only" />
                      {option}
                    </label>
                  ))}
                </div>
                <ErrorMsg error={errors.computerLiteracy} />
              </div>

              <div className="md:col-span-2">
                <FieldLabel optional>Relevant Skills / Experience</FieldLabel>
                <textarea {...register('relevantSkills')} rows={4} className="portal-textarea" placeholder="Describe any relevant skills or prior experience..." />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number={7}
            title="Emergency Contact"
            description="Add a reliable contact person we can reach in case of an urgent follow-up."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Name</FieldLabel>
                <input
                  {...register('emergencyName')}
                  className={getInputClass(errors.emergencyName)}
                  placeholder="Emergency contact full name"
                  autoComplete="name"
                />
                <ErrorMsg error={errors.emergencyName} />
              </div>
              <div>
                <FieldLabel>Relationship</FieldLabel>
                <input {...register('emergencyRelationship')} className={getInputClass(errors.emergencyRelationship)} placeholder="e.g. Parent, Spouse, Sibling" />
                <ErrorMsg error={errors.emergencyRelationship} />
              </div>
              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <input
                  {...register('emergencyPhone')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={13}
                  autoComplete="tel"
                  className={getInputClass(errors.emergencyPhone)}
                  placeholder="e.g. 0241234567 or +233241234567"
                />
                <ErrorMsg error={errors.emergencyPhone} />
              </div>
            </div>
          </SectionCard>

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
      </main>

      <Footer />

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
          message={'Welcome, ' + modal.name + '! Your registration has been submitted successfully. We will be in touch with further details.'}
          onClose={handleSuccessClose}
        />
      ) : null}

      {modal?.type === 'error' ? (
        <Modal title="Registration Failed" message={modal.message} onClose={() => setModal(null)} />
      ) : null}
    </div>
  );
}
