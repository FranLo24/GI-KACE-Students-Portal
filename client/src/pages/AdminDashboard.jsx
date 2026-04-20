import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';

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
    title: '1. Personal Information',
    fields: ['fullName', 'gender', 'nationality', 'idType', 'idTypeOther', 'idNumber'],
  },
  {
    title: '2. Contact Information',
    fields: ['phoneNumber', 'alternativePhone', 'emailAddress', 'residentialAddress', 'cityTown'],
  },
  {
    title: '3. Educational Background',
    fields: ['highestEducation', 'highestEducationOther', 'fieldOfStudy'],
  },
  {
    title: '4. Employment Information',
    fields: ['employmentStatus', 'organizationName', 'jobTitle', 'yearsOfExperience'],
  },
  {
    title: '5. Course Details',
    fields: ['courseTitle', 'courseCategory', 'courseCategoryOther'],
  },
  {
    title: '6. ICT Skills & Experience',
    fields: ['computerLiteracy', 'relevantSkills'],
  },
  {
    title: '7. Emergency Contact',
    fields: ['emergencyName', 'emergencyRelationship', 'emergencyPhone'],
  },
];

const EDUCATION_OPTIONS = [
  'Basic Education (Primary/JHS)',
  'Senior High School (SHS/WASSCE)',
  'Diploma',
  'Bachelor\'s Degree',
  'Master\'s Degree',
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

function ViewModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Student Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">{section.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.fields.map((field) => {
                  const val = student[field];
                  if (!val) return null;
                  return (
                    <div key={field}>
                      <p className="text-xs text-gray-500">{FIELD_LABELS[field]}</p>
                      <p className="text-sm text-gray-800 font-medium break-words">
                        {field === 'createdAt' ? new Date(val).toLocaleDateString() : val}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 bg-white border-t px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
          >
            Close
          </button>
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
      await api.put(`/admin/students/${student.id}`, form);
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
        <label className="block text-xs text-gray-600 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          required={required}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  function selectField(name, label, options, required = false) {
    return (
      <div key={name}>
        <label className="block text-xs text-gray-600 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          required={required}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Edit Student</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-4 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">1. Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('fullName', 'Full Name', 'text', true)}
                {selectField('gender', 'Gender', ['Male', 'Female'], true)}
                {field('nationality', 'Nationality', 'text', true)}
                {selectField('idType', 'ID Type', ['Ghana Card', 'Passport', 'Other'], true)}
                {form.idType === 'Other' && field('idTypeOther', 'ID Type (Other)', 'text', true)}
                {field('idNumber', 'ID Number', 'text', true)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">2. Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('phoneNumber', 'Phone Number', 'tel', true)}
                {field('alternativePhone', 'Alternative Phone', 'tel')}
                {field('emailAddress', 'Email Address', 'email', true)}
                {field('residentialAddress', 'Residential Address', 'text', true)}
                {field('cityTown', 'City / Town', 'text', true)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">3. Educational Background</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectField('highestEducation', 'Highest Education', EDUCATION_OPTIONS, true)}
                {form.highestEducation === 'Other' && field('highestEducationOther', 'Education (Other)', 'text', true)}
                {field('fieldOfStudy', 'Field of Study', 'text', true)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">4. Employment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectField('employmentStatus', 'Employment Status', EMPLOYMENT_OPTIONS, true)}
                {field('organizationName', 'Organization Name')}
                {field('jobTitle', 'Job Title')}
                {field('yearsOfExperience', 'Years of Experience')}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">5. Course Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('courseTitle', 'Course Title', 'text', true)}
                {selectField('courseCategory', 'Course Category', COURSE_CATEGORIES, true)}
                {form.courseCategory === 'Other' && field('courseCategoryOther', 'Course Category (Other)', 'text', true)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">6. ICT Skills & Experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectField('computerLiteracy', 'Computer Literacy', COMPUTER_LITERACY_OPTIONS, true)}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Relevant Skills</label>
                  <textarea
                    name="relevantSkills"
                    value={form.relevantSkills || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">7. Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('emergencyName', 'Emergency Contact Name', 'text', true)}
                {field('emergencyRelationship', 'Relationship', 'text', true)}
                {field('emergencyPhone', 'Emergency Phone', 'tel', true)}
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="sticky bottom-0 bg-white border-t px-6 py-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition text-sm"
            >
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

  const fetchStudents = useCallback(async (q) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/admin/students', { params: q ? { q } : {} });
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
    navigate('/admin/login');
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/students/${deleteStudent.id}`);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone, or course category…"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">
            {fetchError}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Course Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Registered</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchInput ? 'No students match your search.' : 'No students registered yet.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{s.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{s.emailAddress}</td>
                      <td className="px-4 py-3 text-gray-600">{s.phoneNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{s.courseCategory}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewStudent(s)}
                            className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setEditStudent(s)}
                            className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteStudent(s)}
                            className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
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
            <div className="border-t px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, students.length)} of {students.length} students
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded border transition ${
                      p === page
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {viewStudent && (
        <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />
      )}

      {editStudent && (
        <EditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSaved={handleEditSaved}
        />
      )}

      {deleteStudent && (
        <Modal
          title="Delete Student"
          message={`Are you sure you want to delete ${deleteStudent.fullName}? This action cannot be undone.`}
          showCancel
          onClose={() => setDeleteStudent(null)}
          onConfirm={deleteLoading ? undefined : handleDelete}
        />
      )}

      {successModal && (
        <Modal
          title="Success"
          message={successModal}
          onClose={() => setSuccessModal('')}
        />
      )}
    </div>
  );
}
