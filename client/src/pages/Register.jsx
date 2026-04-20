import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import api from '../api/axios';
import { registrationSchema } from '../schemas/registrationSchema';

const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'Other',
];

const COURSE_CATEGORIES = [
  'Cybersecurity',
  'Data Analytics with Python',
  'Data Analytics with BI',
  'Certificate in Software Development',
  'CCNA',
  'Diploma in Business Computing',
  'Office Productivity Suite',
  'Corporate Trainings',
  'Other',
];

const EMPLOYMENT_STATUSES = ['Employed', 'Self-Employed', 'Unemployed', 'Student'];
const COMPUTER_LITERACY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Register() {
  const [modal, setModal] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
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

  const idType = watch('idType');
  const highestEducation = watch('highestEducation');
  const courseCategory = watch('courseCategory');

  const onSubmit = (data) => {
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

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="text-red-500 text-xs mt-1">{errors[field].message}</p>
    ) : null;

  const SectionCard = ({ children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">{children}</div>
  );

  const SectionTitle = ({ num, title }) => (
    <h2 className="text-lg font-semibold text-blue-700 border-b border-blue-100 pb-2 mb-5">
      {num}. {title}
    </h2>
  );

  const FieldLabel = ({ children, optional }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}{' '}
      {optional ? (
        <span className="text-gray-400 font-normal">(optional)</span>
      ) : (
        <span className="text-red-400">*</span>
      )}
    </label>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">GI-KACE Course Registration</h1>
          <p className="text-gray-500 text-sm">
            Fields marked with <span className="text-red-400 font-medium">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

          {/* Section 1: Personal Information */}
          <SectionCard>
            <SectionTitle num={1} title="Personal Information" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input
                  {...register('fullName')}
                  className={inputClass('fullName')}
                  placeholder="Enter your full name"
                />
                <ErrorMsg field="fullName" />
              </div>

              <div>
                <FieldLabel>Gender</FieldLabel>
                <div className="flex gap-6 mt-1">
                  {['Male', 'Female'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={g}
                        {...register('gender')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg field="gender" />
              </div>

              <div>
                <FieldLabel>Nationality</FieldLabel>
                <input
                  {...register('nationality')}
                  className={inputClass('nationality')}
                  placeholder="e.g. Ghanaian"
                />
                <ErrorMsg field="nationality" />
              </div>

              <div>
                <FieldLabel>ID Type</FieldLabel>
                <div className="flex flex-wrap gap-6 mt-1">
                  {['Ghana Card', 'Passport', 'Other'].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={t}
                        {...register('idType')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg field="idType" />
                {idType === 'Other' && (
                  <div className="mt-2">
                    <input
                      {...register('idTypeOther')}
                      className={inputClass('idTypeOther')}
                      placeholder="Please specify your ID type"
                    />
                    <ErrorMsg field="idTypeOther" />
                  </div>
                )}
              </div>

              <div>
                <FieldLabel>ID Number</FieldLabel>
                <input
                  {...register('idNumber')}
                  className={inputClass('idNumber')}
                  placeholder="Enter your ID number"
                />
                <ErrorMsg field="idNumber" />
              </div>

            </div>
          </SectionCard>

          {/* Section 2: Contact Information */}
          <SectionCard>
            <SectionTitle num={2} title="Contact Information" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <input
                  {...register('phoneNumber')}
                  className={inputClass('phoneNumber')}
                  placeholder="e.g. 0241234567"
                />
                <ErrorMsg field="phoneNumber" />
              </div>

              <div>
                <FieldLabel optional>Alternative Phone</FieldLabel>
                <input
                  {...register('alternativePhone')}
                  className={inputClass('alternativePhone')}
                  placeholder="e.g. 0201234567"
                />
                <ErrorMsg field="alternativePhone" />
              </div>

              <div>
                <FieldLabel>Email Address</FieldLabel>
                <input
                  type="email"
                  {...register('emailAddress')}
                  className={inputClass('emailAddress')}
                  placeholder="you@example.com"
                />
                <ErrorMsg field="emailAddress" />
              </div>

              <div>
                <FieldLabel>Residential Address</FieldLabel>
                <input
                  {...register('residentialAddress')}
                  className={inputClass('residentialAddress')}
                  placeholder="Enter your residential address"
                />
                <ErrorMsg field="residentialAddress" />
              </div>

              <div>
                <FieldLabel>City / Town</FieldLabel>
                <input
                  {...register('cityTown')}
                  className={inputClass('cityTown')}
                  placeholder="e.g. Accra"
                />
                <ErrorMsg field="cityTown" />
              </div>

            </div>
          </SectionCard>

          {/* Section 3: Educational Background */}
          <SectionCard>
            <SectionTitle num={3} title="Educational Background" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Highest Level of Education</FieldLabel>
                <div className="flex flex-col gap-2 mt-1">
                  {EDUCATION_LEVELS.map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={level}
                        {...register('highestEducation')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg field="highestEducation" />
                {highestEducation === 'Other' && (
                  <div className="mt-2">
                    <input
                      {...register('highestEducationOther')}
                      className={inputClass('highestEducationOther')}
                      placeholder="Please specify your education level"
                    />
                    <ErrorMsg field="highestEducationOther" />
                  </div>
                )}
              </div>

              <div>
                <FieldLabel>Field of Study</FieldLabel>
                <input
                  {...register('fieldOfStudy')}
                  className={inputClass('fieldOfStudy')}
                  placeholder="e.g. Computer Science, Business"
                />
                <ErrorMsg field="fieldOfStudy" />
              </div>

            </div>
          </SectionCard>

          {/* Section 4: Employment Information */}
          <SectionCard>
            <SectionTitle num={4} title="Employment Information" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Employment Status</FieldLabel>
                <div className="flex flex-wrap gap-6 mt-1">
                  {EMPLOYMENT_STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={s}
                        {...register('employmentStatus')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg field="employmentStatus" />
              </div>

              <div>
                <FieldLabel optional>Organization Name</FieldLabel>
                <input
                  {...register('organizationName')}
                  className={inputClass('organizationName')}
                  placeholder="Enter your organization name"
                />
              </div>

              <div>
                <FieldLabel optional>Job Title</FieldLabel>
                <input
                  {...register('jobTitle')}
                  className={inputClass('jobTitle')}
                  placeholder="Enter your job title"
                />
              </div>

              <div>
                <FieldLabel optional>Years of Experience</FieldLabel>
                <input
                  {...register('yearsOfExperience')}
                  className={inputClass('yearsOfExperience')}
                  placeholder="e.g. 3"
                />
              </div>

            </div>
          </SectionCard>

          {/* Section 5: Course Details */}
          <SectionCard>
            <SectionTitle num={5} title="Course Details" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Course Title</FieldLabel>
                <input
                  {...register('courseTitle')}
                  className={inputClass('courseTitle')}
                  placeholder="Enter the course title"
                />
                <ErrorMsg field="courseTitle" />
              </div>

              <div>
                <FieldLabel>Course Category</FieldLabel>
                <div className="flex flex-col gap-2 mt-1">
                  {COURSE_CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={cat}
                        {...register('courseCategory')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg field="courseCategory" />
                {courseCategory === 'Other' && (
                  <div className="mt-2">
                    <input
                      {...register('courseCategoryOther')}
                      className={inputClass('courseCategoryOther')}
                      placeholder="Please specify the course category"
                    />
                    <ErrorMsg field="courseCategoryOther" />
                  </div>
                )}
              </div>

            </div>
          </SectionCard>

          {/* Section 6: ICT Skills & Experience */}
          <SectionCard>
            <SectionTitle num={6} title="ICT Skills & Experience" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Level of Computer Literacy</FieldLabel>
                <div className="flex flex-wrap gap-6 mt-1">
                  {COMPUTER_LITERACY_LEVELS.map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={level}
                        {...register('computerLiteracy')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg field="computerLiteracy" />
              </div>

              <div>
                <FieldLabel optional>Relevant Skills / Experience</FieldLabel>
                <textarea
                  {...register('relevantSkills')}
                  rows={4}
                  className={`${inputClass('relevantSkills')} resize-none`}
                  placeholder="Describe any relevant skills or prior experience..."
                />
              </div>

            </div>
          </SectionCard>

          {/* Section 7: Emergency Contact */}
          <SectionCard>
            <SectionTitle num={7} title="Emergency Contact" />
            <div className="space-y-4">

              <div>
                <FieldLabel>Name</FieldLabel>
                <input
                  {...register('emergencyName')}
                  className={inputClass('emergencyName')}
                  placeholder="Emergency contact full name"
                />
                <ErrorMsg field="emergencyName" />
              </div>

              <div>
                <FieldLabel>Relationship</FieldLabel>
                <input
                  {...register('emergencyRelationship')}
                  className={inputClass('emergencyRelationship')}
                  placeholder="e.g. Parent, Spouse, Sibling"
                />
                <ErrorMsg field="emergencyRelationship" />
              </div>

              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <input
                  {...register('emergencyPhone')}
                  className={inputClass('emergencyPhone')}
                  placeholder="e.g. 0241234567"
                />
                <ErrorMsg field="emergencyPhone" />
              </div>

            </div>
          </SectionCard>

          <div className="flex justify-center pt-2 pb-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white font-semibold px-12 py-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {submitting ? 'Submitting…' : 'Submit Registration'}
            </button>
          </div>

        </form>
      </main>

      <Footer />

      {modal?.type === 'confirm' && (
        <Modal
          title="Confirm Registration"
          message="Are you sure you want to submit your registration? Please review your details before confirming."
          showCancel
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'success' && (
        <Modal
          title="Registration Successful!"
          message={`Welcome, ${modal.name}! Your registration has been submitted successfully. We will be in touch with further details.`}
          onClose={handleSuccessClose}
        />
      )}

      {modal?.type === 'error' && (
        <Modal
          title="Registration Failed"
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
