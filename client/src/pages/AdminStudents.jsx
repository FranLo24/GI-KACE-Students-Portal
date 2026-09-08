import { useCallback, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useCourses } from '../hooks/useCourses';
import { isFieldVisible, sortByOrder } from '../utils/dynamicForm';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';

const PAGE_SIZE = 10;

const STATIC_FIELD_LABELS = {
  createdAt: 'Registered Date',
  admissionStatus: 'Admission Status',
  admittedAt: 'Admitted On',
  admissionSmsStatus: 'Admission SMS',
  admissionEmailStatus: 'Admission Email',
  attendanceStatus: 'Attendance',
  courseCompletionStatus: 'Course Completion',
  completedAt: 'Completed On',
};

const STATIC_VIEW_SECTIONS = [
  { title: 'Admission', fields: ['admissionStatus', 'admittedAt', 'admissionSmsStatus', 'admissionEmailStatus'] },
  { title: 'Attendance & Completion', fields: ['attendanceStatus', 'courseCompletionStatus', 'completedAt'] },
];

const ADMISSION_BADGE_STYLES = {
  pending: 'bg-slate-100 text-slate-600',
  admitted: 'bg-emerald-100 text-emerald-700',
};

const ATTENDANCE_BADGE_STYLES = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  not_marked: 'bg-slate-100 text-slate-600',
};

const COMPLETION_BADGE_STYLES = {
  completed: 'bg-emerald-100 text-emerald-700',
  not_completed: 'bg-slate-100 text-slate-600',
};

function StatusBadge({ value, styles }) {
  return (
    <span
      className={
        'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (styles[value] || 'bg-slate-100 text-slate-600')
      }
    >
      {String(value).replace(/_/g, ' ')}
    </span>
  );
}

function formatFieldValue(field, value) {
  if (field === 'createdAt' || field === 'admittedAt' || field === 'completedAt') {
    return new Date(value).toLocaleDateString();
  }
  if (field === 'attendanceStatus' || field === 'courseCompletionStatus') {
    return String(value).replace(/_/g, ' ');
  }
  return value;
}

const COMPUTER_LITERACY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

const EMPTY_FILTERS = {
  admissionStatus: '',
  attendanceStatus: '',
  courseCompletionStatus: '',
  courseCategory: '',
  computerLiteracy: '',
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function ViewModal({ student, sections, onClose }) {
  const knownKeys = new Set(sections.flatMap((section) => (section.fields || []).map((field) => field.key)));
  const orphanKeys = Object.keys(student.customFields || {}).filter((key) => !knownKeys.has(key));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Student profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{student.fullName}</h2>
          </div>
          <button type="button" onClick={onClose} className="portal-button-secondary px-4 py-2">
            Close
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-5">
            {sections.map((section) => {
              const entries = sortByOrder(section.fields || [])
                .map((field) => ({
                  field,
                  value: field.isBuiltIn ? student[field.key] : student.customFields?.[field.key],
                }))
                .filter(({ value }) => value !== undefined && value !== null && value !== '');

              if (entries.length === 0) return null;

              return (
                <section key={section.key} className="portal-panel p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {entries.map(({ field, value }) => (
                      <div key={field.key} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{field.label}</p>
                        <p className="mt-2 text-sm font-medium text-slate-700 break-words">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {orphanKeys.length > 0 && (
              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Additional details</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {orphanKeys.map((key) => (
                    <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{key}</p>
                      <p className="mt-2 text-sm font-medium text-slate-700 break-words">{String(student.customFields[key])}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {STATIC_VIEW_SECTIONS.map((section) => {
              const entries = section.fields
                .map((key) => ({ key, value: student[key] }))
                .filter(({ value }) => value !== undefined && value !== null && value !== '');
              if (entries.length === 0) return null;

              return (
                <section key={section.title} className="portal-panel p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {entries.map(({ key, value }) => (
                      <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{STATIC_FIELD_LABELS[key]}</p>
                        <p className="mt-2 text-sm font-medium text-slate-700 break-words">{formatFieldValue(key, value)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DynamicEditField({ field, value, onChange }) {
  const label = field.label;
  const required = field.required;

  if (field.type === 'textarea') {
    return (
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} className="portal-textarea" />
      </div>
    );
  }

  if (field.type === 'select' || field.type === 'radio') {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-blue-500">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="portal-select"
        >
          <option value="">Select</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-blue-600"
        />
        <label className="text-sm font-medium text-slate-700">{label}</label>
      </div>
    );
  }

  const inputType = ['email', 'tel', 'number', 'date'].includes(field.type) ? field.type : 'text';
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-blue-500">*</span>}
      </label>
      <input
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="portal-input"
      />
    </div>
  );
}

function EditModal({ student, sections, onClose, onSaved, onUnauthorized, onRefresh }) {
  const [form, setForm] = useState({ ...student, customFields: student.customFields || {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [admitLoading, setAdmitLoading] = useState(false);
  const [admitResult, setAdmitResult] = useState(null);

  const formValues = { ...form, ...(form.customFields || {}) };

  function readValue(field) {
    return field.isBuiltIn ? form[field.key] : form.customFields?.[field.key];
  }

  function writeValue(field, value) {
    if (field.isBuiltIn) {
      setForm((prev) => ({ ...prev, [field.key]: value }));
    } else {
      setForm((prev) => ({ ...prev, customFields: { ...(prev.customFields || {}), [field.key]: value } }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put('/admin/students/' + student.id, form);
      onSaved();
    } catch (error) {
      if (error.response?.status === 401) {
        onUnauthorized();
        return;
      }

      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdmit() {
    setAdmitLoading(true);
    setAdmitResult(null);
    try {
      const res = await api.post('/admin/students/' + student.id + '/admit');
      setForm((prev) => ({ ...prev, admissionStatus: 'admitted' }));
      setAdmitResult({ ok: true, smsStatus: res.data.smsStatus, emailStatus: res.data.emailStatus });
      onRefresh();
    } catch (error) {
      if (error.response?.status === 401) {
        onUnauthorized();
        return;
      }

      setAdmitResult({ ok: false, message: error.response?.data?.message || 'Failed to admit student.' });
    } finally {
      setAdmitLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-5xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Student editor</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Edit Student</h2>
          </div>
          <button type="button" onClick={onClose} className="portal-button-secondary px-4 py-2">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
            <div className="grid gap-5">
              {sections.map((section) => {
                const fields = sortByOrder(section.fields || []);
                return (
                  <section key={section.key} className="portal-panel p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {fields.map((field) => {
                        if (!isFieldVisible(field, formValues)) return null;
                        return (
                          <DynamicEditField
                            key={field.key}
                            field={field}
                            value={readValue(field)}
                            onChange={(value) => writeValue(field, value)}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Admission</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Admission Status</label>
                    <p className="portal-input bg-slate-50 capitalize text-slate-600">{form.admissionStatus}</p>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAdmit}
                      disabled={form.admissionStatus === 'admitted' || admitLoading}
                      className="portal-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {admitLoading
                        ? 'Admitting…'
                        : form.admissionStatus === 'admitted'
                        ? 'Already Admitted'
                        : 'Admit Student'}
                    </button>
                  </div>
                </div>

                {admitResult && (
                  <div
                    className={
                      'mt-4 rounded-2xl border px-4 py-3 text-sm ' +
                      (admitResult.ok && admitResult.smsStatus === 'sent' && admitResult.emailStatus === 'sent'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : admitResult.ok
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-red-200 bg-red-50 text-red-700')
                    }
                  >
                    {admitResult.ok
                      ? `Student admitted. SMS: ${admitResult.smsStatus}, Email: ${admitResult.emailStatus}.`
                      : admitResult.message}
                  </div>
                )}
              </section>

              {error && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
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

export default function AdminStudents() {
  const handleUnauthorizedAccess = useUnauthorizedRedirect();
  const { courses } = useCourses();
  const filterCourseCategories = [...courses.map((course) => course.category), 'Other'];

  const [students, setStudents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successModal, setSuccessModal] = useState('');

  const [formSections, setFormSections] = useState([]);

  const debouncedSearch = useDebounce(searchInput, 300);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    api
      .get('/admin/form-config')
      .then((res) => {
        const enabled = (res.data.sections || [])
          .filter((section) => section.enabled)
          .map((section) => ({ ...section, fields: (section.fields || []).filter((field) => field.enabled) }));
        setFormSections(sortByOrder(enabled));
      })
      .catch((error) => {
        if (error.response?.status === 401) handleUnauthorizedAccess();
      });
  }, [handleUnauthorizedAccess]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = {};
      if (debouncedSearch) params.q = debouncedSearch;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await api.get('/admin/students', { params });
      setStudents(res.data);
      setPage(1);
      setSelectedIds(new Set());
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }

      setFetchError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, handleUnauthorizedAccess]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.delete('/admin/students/' + deleteStudent.id);
      setDeleteStudent(null);
      setSuccessModal('Student record deleted successfully.');
      fetchStudents();
    } catch (error) {
      setDeleteStudent(null);

      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }

      setFetchError('Failed to delete student. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditSaved() {
    setEditStudent(null);
    setSuccessModal('Student record updated successfully.');
    fetchStudents();
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = paginated.length > 0 && paginated.every((student) => next.has(student.id));
      paginated.forEach((student) => {
        if (allSelected) {
          next.delete(student.id);
        } else {
          next.add(student.id);
        }
      });
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleBulkAdmit() {
    setBulkLoading(true);
    try {
      const res = await api.post('/admin/students/bulk-admit', { ids: Array.from(selectedIds) });
      setBulkConfirm(null);
      setSuccessModal(
        `Admitted ${res.data.admitted} student(s).` +
          (res.data.alreadyAdmitted > 0 ? ` ${res.data.alreadyAdmitted} were already admitted.` : '')
      );
      fetchStudents();
    } catch (error) {
      setBulkConfirm(null);
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setFetchError('Failed to admit the selected students. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkDelete() {
    setBulkLoading(true);
    try {
      const res = await api.post('/admin/students/bulk-delete', { ids: Array.from(selectedIds) });
      setBulkConfirm(null);
      setSuccessModal(`Deleted ${res.data.deleted} student record(s).`);
      fetchStudents();
    } catch (error) {
      setBulkConfirm(null);
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setFetchError('Failed to delete the selected students. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkAttendance(e) {
    const status = e.target.value;
    if (!status) return;
    e.target.value = '';

    setBulkLoading(true);
    try {
      await api.post('/admin/students/bulk-attendance', { ids: Array.from(selectedIds), status });
      setSuccessModal('Attendance updated for the selected students.');
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setFetchError('Failed to update attendance. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkCompletion(e) {
    const status = e.target.value;
    if (!status) return;
    e.target.value = '';

    setBulkLoading(true);
    try {
      await api.post('/admin/students/bulk-completion', { ids: Array.from(selectedIds), status });
      setSuccessModal('Course completion updated for the selected students.');
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setFetchError('Failed to update course completion. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <span className="portal-kicker">Portal operations</span>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Students</h1>
        <p className="mt-2 max-w-2xl text-lg text-slate-600">
          Search the full registration database, refine with filters, and manage individual or bulk student records.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-1">
        <div className="portal-panel p-6">
          <div className="rounded-[24px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Search and review</p>
            <p className="mt-2 text-sm text-slate-200">
              Search the full registration database by name, email, phone, or course category, then refine with filters.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, phone, or course category…"
                className="w-full flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-200/20"
              />
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={
                  'shrink-0 rounded-2xl border px-5 py-3 text-sm font-semibold transition ' +
                  (showFilters
                    ? 'border-blue-300 bg-blue-500/20 text-white'
                    : 'border-white/15 bg-white/10 text-white hover:bg-white/20')
                }
              >
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Refine results</p>
                {activeFilterCount > 0 && (
                  <button type="button" onClick={clearFilters} className="text-xs font-semibold text-blue-700 hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Admission</label>
                  <select
                    value={filters.admissionStatus}
                    onChange={(e) => updateFilter('admissionStatus', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="admitted">Admitted</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Attendance</label>
                  <select
                    value={filters.attendanceStatus}
                    onChange={(e) => updateFilter('attendanceStatus', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="not_marked">Not Marked</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Completion</label>
                  <select
                    value={filters.courseCompletionStatus}
                    onChange={(e) => updateFilter('courseCompletionStatus', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="not_completed">Not Completed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Course category</label>
                  <select
                    value={filters.courseCategory}
                    onChange={(e) => updateFilter('courseCategory', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    {filterCourseCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Literacy level</label>
                  <select
                    value={filters.computerLiteracy}
                    onChange={(e) => updateFilter('computerLiteracy', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    {COMPUTER_LITERACY_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="portal-panel overflow-hidden">
          {fetchError && (
            <div className="border-b border-blue-100 bg-blue-50 px-6 py-4 text-sm text-blue-700">{fetchError}</div>
          )}

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-blue-100 bg-blue-50/70 px-6 py-4">
              <p className="text-sm font-semibold text-blue-700">{selectedIds.size} selected</p>
              <button
                type="button"
                onClick={() => setBulkConfirm('admit')}
                disabled={bulkLoading}
                className="portal-button-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Admit Selected
              </button>
              <select
                defaultValue=""
                onChange={handleBulkAttendance}
                disabled={bulkLoading}
                className="portal-select w-44 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Set attendance…
                </option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="not_marked">Not Marked</option>
              </select>
              <select
                defaultValue=""
                onChange={handleBulkCompletion}
                disabled={bulkLoading}
                className="portal-select w-48 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Set completion…
                </option>
                <option value="completed">Completed</option>
                <option value="not_completed">Not Completed</option>
              </select>
              <button
                type="button"
                onClick={() => setBulkConfirm('delete')}
                disabled={bulkLoading}
                className="portal-button-secondary bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 hover:text-red-700 px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={bulkLoading}
                className="portal-button-secondary ml-auto px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear selection
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((student) => selectedIds.has(student.id))}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all students on this page"
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold">#</th>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Phone</th>
                  <th className="px-5 py-4 font-semibold">Course Category</th>
                  <th className="px-5 py-4 font-semibold">Admission</th>
                  <th className="px-5 py-4 font-semibold">Attendance</th>
                  <th className="px-5 py-4 font-semibold">Completion</th>
                  <th className="px-5 py-4 font-semibold">Registered</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-10 text-center text-slate-500">Loading…</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-10 text-center text-slate-500">
                      {searchInput || activeFilterCount > 0 ? 'No students match your search or filters.' : 'No students registered yet.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((student, index) => (
                    <tr key={student.id} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(student.id)}
                          onChange={() => toggleSelectOne(student.id)}
                          aria-label={`Select ${student.fullName}`}
                        />
                      </td>
                      <td className="px-5 py-4 text-slate-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{student.fullName}</td>
                      <td className="px-5 py-4 text-slate-600">{student.emailAddress}</td>
                      <td className="px-5 py-4 text-slate-600">{student.phoneNumber}</td>
                      <td className="px-5 py-4 text-slate-600">{student.courseCategory}</td>
                      <td className="px-5 py-4">
                        <StatusBadge value={student.admissionStatus} styles={ADMISSION_BADGE_STYLES} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge value={student.attendanceStatus} styles={ATTENDANCE_BADGE_STYLES} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge value={student.courseCompletionStatus} styles={COMPLETION_BADGE_STYLES} />
                      </td>
                      <td className="px-5 py-4 text-slate-600">{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setViewStudent(student)} className="portal-button-secondary px-4 py-2 text-xs">
                            View
                          </button>
                          <button type="button" onClick={() => setEditStudent(student)} className="portal-button-secondary bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 text-xs">
                            Edit
                          </button>
                          <button type="button" onClick={() => setDeleteStudent(student)} className="portal-button-secondary bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 text-xs">
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
                        ? 'bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/60'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700',
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
      </div>

      {viewStudent && <ViewModal student={viewStudent} sections={formSections} onClose={() => setViewStudent(null)} />}

      {editStudent && (
        <EditModal
          student={editStudent}
          sections={formSections}
          onClose={() => setEditStudent(null)}
          onSaved={handleEditSaved}
          onUnauthorized={handleUnauthorizedAccess}
          onRefresh={fetchStudents}
        />
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

      {bulkConfirm === 'admit' && (
        <Modal
          title="Admit Selected Students"
          message={`Admit ${selectedIds.size} student(s)? Each will receive an admission SMS and email.`}
          showCancel
          onClose={() => setBulkConfirm(null)}
          onConfirm={bulkLoading ? undefined : handleBulkAdmit}
        />
      )}

      {bulkConfirm === 'delete' && (
        <Modal
          title="Delete Selected Students"
          message={`Delete ${selectedIds.size} student record(s)? This action cannot be undone.`}
          showCancel
          onClose={() => setBulkConfirm(null)}
          onConfirm={bulkLoading ? undefined : handleBulkDelete}
        />
      )}

      {successModal && <Modal title="Success" message={successModal} onClose={() => setSuccessModal('')} />}
    </div>
  );
}
