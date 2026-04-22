import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import dashboardBanner from '../assets/dashboard-banner.png';

const PAGE_SIZE = 10;

const FIELD_LABELS = {
  fullName: 'Full Name',
  gender: 'Gender',
  nationality: 'Nationality',
  idType: 'ID Type',
  idTypeOther: 'ID Type (Other)',
  idNumber: 'ID Number',
  phoneNumber: 'Phone Number',
  alternativePhone: 'Alternative Phone',
  emailAddress: 'Email Address',
  residentialAddress: 'Residential Address',
  cityTown: 'City / Town',
  highestEducation: 'Highest Education',
  highestEducationOther: 'Education (Other)',
  fieldOfStudy: 'Field of Study',
  employmentStatus: 'Employment Status',
  organizationName: 'Organization Name',
  jobTitle: 'Job Title',
  yearsOfExperience: 'Years of Experience',
  courseTitle: 'Course Title',
  courseCategory: 'Course Category',
  courseCategoryOther: 'Course Category (Other)',
  computerLiteracy: 'Computer Literacy',
  relevantSkills: 'Relevant Skills',
  emergencyName: 'Emergency Contact Name',
  emergencyRelationship: 'Relationship',
  emergencyPhone: 'Emergency Phone',
  createdAt: 'Registered Date',
};

const SECTIONS = [
  {
    title: 'Personal Information',
    fields: ['fullName', 'gender', 'nationality', 'idType', 'idTypeOther', 'idNumber'],
  },
  {
    title: 'Contact Information',
    fields: ['phoneNumber', 'alternativePhone', 'emailAddress', 'residentialAddress', 'cityTown'],
  },
  {
    title: 'Educational Background',
    fields: ['highestEducation', 'highestEducationOther', 'fieldOfStudy'],
  },
  {
    title: 'Employment Information',
    fields: ['employmentStatus', 'organizationName', 'jobTitle', 'yearsOfExperience'],
  },
  {
    title: 'Course Details',
    fields: ['courseTitle', 'courseCategory', 'courseCategoryOther'],
  },
  {
    title: 'ICT Skills & Experience',
    fields: ['computerLiteracy', 'relevantSkills'],
  },
  {
    title: 'Emergency Contact',
    fields: ['emergencyName', 'emergencyRelationship', 'emergencyPhone'],
  },
];

const EDUCATION_OPTIONS = [
  'Basic Education (Primary/JHS)',
  'Senior High School (SHS/WASSCE)',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Professional Certificate',
  'Other',
];

const EMPLOYMENT_OPTIONS = [
  'Employed (Full-time)',
  'Employed (Part-time)',
  'Self-employed',
  'Unemployed',
  'Student',
  'Retired',
];

const COURSE_CATEGORIES = [
  'Information Technology',
  'Cybersecurity',
  'Data Science & Analytics',
  'Software Development',
  'Networking & Infrastructure',
  'Project Management',
  'Digital Marketing',
  'Other',
];

const COMPUTER_LITERACY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function modalFieldBase() {
  return 'portal-input';
}

function ViewModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Student profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{student.fullName}</h2>
          </div>
          <button type="button" onClick={onClose} className="portal-button-secondary px-4 py-2">
            Close
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-5">
            {SECTIONS.map((section) => (
              <section key={section.title} className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.fields.map((field) => {
                    const value = student[field];
                    if (!value) {
                      return null;
                    }

                    return (
                      <div key={field} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {FIELD_LABELS[field]}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-700 break-words">
                          {field === 'createdAt' ? new Date(value).toLocaleDateString() : value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ student, onClose, onSaved }) {
  const [form, setForm] = useState({ ...student });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put('/admin/students/' + student.id, form);
      onSaved();
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function field(name, label, type = 'text', required = false) {
    return (
      <div key={name}>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          required={required}
          className={modalFieldBase()}
        />
      </div>
    );
  }

  function selectField(name, label, options, required = false) {
    return (
      <div key={name}>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        <select
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          required={required}
          className="portal-select"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-5xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Student editor</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Edit Student</h2>
          </div>
          <button type="button" onClick={onClose} className="portal-button-secondary px-4 py-2">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
            <div className="grid gap-5">
              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {field('fullName', 'Full Name', 'text', true)}
                  {selectField('gender', 'Gender', ['Male', 'Female'], true)}
                  {field('nationality', 'Nationality', 'text', true)}
                  {selectField('idType', 'ID Type', ['Ghana Card', 'Passport', 'Other'], true)}
                  {form.idType === 'Other' && field('idTypeOther', 'ID Type (Other)', 'text', true)}
                  {field('idNumber', 'ID Number', 'text', true)}
                </div>
              </section>

              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {field('phoneNumber', 'Phone Number', 'tel', true)}
                  {field('alternativePhone', 'Alternative Phone', 'tel')}
                  {field('emailAddress', 'Email Address', 'email', true)}
                  {field('residentialAddress', 'Residential Address', 'text', true)}
                  {field('cityTown', 'City / Town', 'text', true)}
                </div>
              </section>

              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Education and Work</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {selectField('highestEducation', 'Highest Education', EDUCATION_OPTIONS, true)}
                  {form.highestEducation === 'Other' && field('highestEducationOther', 'Education (Other)', 'text', true)}
                  {field('fieldOfStudy', 'Field of Study', 'text', true)}
                  {selectField('employmentStatus', 'Employment Status', EMPLOYMENT_OPTIONS, true)}
                  {field('organizationName', 'Organization Name')}
                  {field('jobTitle', 'Job Title')}
                  {field('yearsOfExperience', 'Years of Experience')}
                </div>
              </section>

              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Course and Skills</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {field('courseTitle', 'Course Title', 'text', true)}
                  {selectField('courseCategory', 'Course Category', COURSE_CATEGORIES, true)}
                  {form.courseCategory === 'Other' && field('courseCategoryOther', 'Course Category (Other)', 'text', true)}
                  {selectField('computerLiteracy', 'Computer Literacy', COMPUTER_LITERACY_OPTIONS, true)}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Relevant Skills</label>
                    <textarea
                      name="relevantSkills"
                      value={form.relevantSkills || ''}
                      onChange={handleChange}
                      rows={3}
                      className="portal-textarea"
                    />
                  </div>
                </div>
              </section>

              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Emergency Contact</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {field('emergencyName', 'Emergency Contact Name', 'text', true)}
                  {field('emergencyRelationship', 'Relationship', 'text', true)}
                  {field('emergencyPhone', 'Emergency Phone', 'tel', true)}
                </div>
              </section>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/60 px-6 py-5">
            <button type="button" onClick={onClose} className="portal-button-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="portal-button-primary">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page, setPage] = useState(1);

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successModal, setSuccessModal] = useState('');

  const debouncedSearch = useDebounce(searchInput, 300);

  const fetchStudents = useCallback(async (query) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/admin/students', { params: query ? { q: query } : {} });
      setStudents(res.data);
      setPage(1);
    } catch {
      setFetchError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(debouncedSearch);
  }, [debouncedSearch, fetchStudents]);

  function handleLogout() {
    logout();
    navigate('/secure-access/login');
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.delete('/admin/students/' + deleteStudent.id);
      setDeleteStudent(null);
      setSuccessModal('Student record deleted successfully.');
      fetchStudents(debouncedSearch);
    } catch {
      setDeleteStudent(null);
      setFetchError('Failed to delete student. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditSaved() {
    setEditStudent(null);
    setSuccessModal('Student record updated successfully.');
    fetchStudents(debouncedSearch);
  }

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const today = new Date().toDateString();
  const todayRegistrations = students.filter((student) => new Date(student.createdAt).toDateString() === today).length;
  const activeCourses = new Set(students.map((student) => student.courseCategory).filter(Boolean)).size;
  const topCategories = Object.entries(
    students.reduce((accumulator, student) => {
      if (student.courseCategory) {
        accumulator[student.courseCategory] = (accumulator[student.courseCategory] || 0) + 1;
      }
      return accumulator;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="portal-shell min-h-screen">
      <main className="portal-container py-8 pb-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <span className="portal-kicker">Portal operations</span>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
                An <span className="portal-gradient-text">admin dashboard</span> built for fast student record management.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Review registrations, search records quickly, and manage student information through a clear operational workspace.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="portal-data-card">
                <p className="text-3xl font-semibold text-slate-900">{students.length}</p>
                <p className="mt-1 text-sm text-slate-500">Total registrations</p>
              </div>
              <div className="portal-data-card">
                <p className="text-3xl font-semibold text-slate-900">{todayRegistrations}</p>
                <p className="mt-1 text-sm text-slate-500">Registered today</p>
              </div>
              <div className="portal-data-card">
                <p className="text-3xl font-semibold text-slate-900">{activeCourses}</p>
                <p className="mt-1 text-sm text-slate-500">Active course categories</p>
              </div>
            </div>
          </div>

          <div className="glass-panel animate-float-soft overflow-hidden p-3">
            <img src={dashboardBanner} alt="Analytics and student management workspace" className="h-[360px] w-full rounded-[24px] object-cover" />
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-6">
            <div className="portal-panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Session</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
                </div>
                <button onClick={handleLogout} className="portal-button-secondary text-rose-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                  Logout
                </button>
              </div>
              <div className="mt-6 rounded-[24px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">Search and review</p>
                <p className="mt-2 text-sm text-slate-200">
                  Filter the full registration database by name, email, phone, or course category.
                </p>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, phone, or course category…"
                  className="mt-4 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-200/20"
                />
              </div>
            </div>

            <div className="portal-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Top categories</p>
              <div className="mt-5 space-y-4">
                {topCategories.length === 0 ? (
                  <p className="text-sm text-slate-500">Categories will appear here after registrations are submitted.</p>
                ) : (
                  topCategories.map(([name, count]) => (
                    <div key={name} className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{name}</p>
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="portal-panel overflow-hidden">
            {fetchError && (
              <div className="border-b border-rose-100 bg-rose-50 px-6 py-4 text-sm text-rose-700">
                {fetchError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">#</th>
                    <th className="px-5 py-4 font-semibold">Name</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Phone</th>
                    <th className="px-5 py-4 font-semibold">Course Category</th>
                    <th className="px-5 py-4 font-semibold">Registered</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-500">Loading…</td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                        {searchInput ? 'No students match your search.' : 'No students registered yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((student, index) => (
                      <tr key={student.id} className="border-t border-slate-100 transition hover:bg-rose-50/40">
                        <td className="px-5 py-4 text-slate-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{student.fullName}</td>
                        <td className="px-5 py-4 text-slate-600">{student.emailAddress}</td>
                        <td className="px-5 py-4 text-slate-600">{student.phoneNumber}</td>
                        <td className="px-5 py-4 text-slate-600">{student.courseCategory}</td>
                        <td className="px-5 py-4 text-slate-600">{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setViewStudent(student)} className="portal-button-secondary px-4 py-2 text-xs">
                              View
                            </button>
                            <button type="button" onClick={() => setEditStudent(student)} className="portal-button-secondary bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 text-xs">
                              Edit
                            </button>
                            <button type="button" onClick={() => setDeleteStudent(student)} className="portal-button-secondary bg-rose-50 text-rose-700 hover:border-rose-200 hover:bg-rose-100 hover:text-rose-700 px-4 py-2 text-xs">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && students.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row">
                <span>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, students.length)} of {students.length} students
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={page === 1}
                    className="portal-button-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={[
                        'rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
                        pageNumber === page
                          ? 'bg-gradient-to-r from-rose-500 via-red-500 to-blue-600 text-white shadow-lg shadow-rose-200/60'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-700',
                      ].join(' ')}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    disabled={page === totalPages}
                    className="portal-button-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {viewStudent && <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />}

      {editStudent && (
        <EditModal student={editStudent} onClose={() => setEditStudent(null)} onSaved={handleEditSaved} />
      )}

      {deleteStudent && (
        <Modal
          title="Delete Student"
          message={'Are you sure you want to delete ' + deleteStudent.fullName + '? This action cannot be undone.'}
          showCancel
          onClose={() => setDeleteStudent(null)}
          onConfirm={deleteLoading ? undefined : handleDelete}
        />
      )}

      {successModal && <Modal title="Success" message={successModal} onClose={() => setSuccessModal('')} />}
    </div>
  );
}
