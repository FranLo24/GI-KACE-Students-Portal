import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useCourses } from '../hooks/useCourses';
import { useCourseLocations } from '../hooks/useCourseLocations';
import { useCourseLevels } from '../hooks/useCourseLevels';
import { useFormConfig } from '../hooks/useFormConfig';
import {
  getDefaultValues,
  getPersonalNameFields,
  getStudentDisplayName,
  isFieldVisible,
  sortByOrder,
} from '../utils/dynamicForm';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';

const PAGE_SIZE = 10;

const STATIC_FIELD_LABELS = {
  createdAt: 'Registered Date',
  admissionStatus: 'Shortlist Status',
  admittedAt: 'Shortlisted On',
  paymentReference: 'Payment Reference',
  paymentStatus: 'Payment Status',
};

const STATIC_VIEW_SECTIONS = [
  { title: 'Shortlist', fields: ['admissionStatus', 'admittedAt', 'paymentReference', 'paymentStatus'] },
];

const ADMISSION_BADGE_STYLES = {
  pending: 'bg-slate-100 text-slate-600',
  admitted: 'bg-emerald-100 text-emerald-700',
};

const ADMISSION_STATUS_LABELS = {
  pending: 'Pending',
  admitted: 'Shortlisted',
};

// Keyed by the status strings the invoice site's POST /invoices/status returns.
// Anything not listed falls back to StatusBadge's default styling and label.
const PAYMENT_BADGE_STYLES = {
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_LABELS = {
  partial: 'Partially Paid',
};

function paymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || String(status).replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function StatusBadge({ value, styles, labels }) {
  return (
    <span
      className={
        'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' +
        (styles[value] || 'bg-slate-100 text-slate-600')
      }
    >
      {labels?.[value] || String(value).replace(/_/g, ' ')}
    </span>
  );
}

function formatFieldValue(field, value) {
  if (field === 'createdAt' || field === 'admittedAt') {
    return new Date(value).toLocaleDateString();
  }
  if (field === 'admissionStatus') {
    return ADMISSION_STATUS_LABELS[value] || value;
  }
  if (field === 'paymentStatus') {
    return paymentStatusLabel(value);
  }
  return value;
}

// Shortlisting creates the student's invoice, so the confirmation names the
// invoice product that was billed.
function shortlistedMessage(name, matchedProduct) {
  return (
    `${name} has been shortlisted and invoiced` +
    (matchedProduct ? ` for "${matchedProduct.name}" (GHS ${matchedProduct.price}).` : '.')
  );
}

const COMPUTER_LITERACY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

const EMPTY_FILTERS = {
  admissionStatus: '',
  courseCategory: '',
  computerLiteracy: '',
  location: '',
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
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{getStudentDisplayName(student, sections)}</h2>
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

// Each course category belongs to a computer literacy level (Settings → Course
// Levels), and the registration form only offers courses for the level the
// student picked. The editor follows the same rule. "Other" stays available, as
// does whatever the student already has, so an existing choice is never dropped
// from the list without the admin seeing it.
function courseCategoryOptions(field, levelByCategory, literacy, currentValue) {
  const options = field.options || [];
  if (!literacy) return options;

  const allowed = options.filter((option) => option === 'Other' || levelByCategory.get(option) === literacy);
  if (currentValue && !allowed.includes(currentValue)) allowed.push(currentValue);
  return allowed;
}

// Each category in the catalogue holds a single course, so choosing a category
// settles the course title too. A category with no course, or more than one,
// leaves the title as it was for the admin to fill in, and "Other" clears it so a
// custom programme can be typed — the same as picking a custom course on the
// public registration form.
function titleForCategory(category, titlesByCategory, currentTitle) {
  if (category === 'Other') return '';

  const titles = titlesByCategory.get(category) || [];
  return titles.length === 1 ? titles[0] : currentTitle;
}

function DynamicEditField({ field, value, onChange, hint }) {
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
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
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
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function EditModal({ student, sections, levelByCategory, titlesByCategory, onClose, onSaved, onUnauthorized, onRefresh }) {
  const [form, setForm] = useState({ ...student, customFields: student.customFields || {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [admitLoading, setAdmitLoading] = useState(false);
  const [admitResult, setAdmitResult] = useState(null);
  const [admitConfirmOpen, setAdmitConfirmOpen] = useState(false);

  const formValues = { ...form, ...(form.customFields || {}) };

  function readValue(field) {
    return field.isBuiltIn ? form[field.key] : form.customFields?.[field.key];
  }

  function writeValue(field, value) {
    if (field.isBuiltIn) {
      setForm((prev) => ({
        ...prev,
        [field.key]: value,
        ...(field.key === 'courseCategory'
          ? { courseTitle: titleForCategory(value, titlesByCategory, prev.courseTitle) }
          : {}),
      }));
    } else {
      setForm((prev) => ({ ...prev, customFields: { ...(prev.customFields || {}), [field.key]: value } }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Sent flattened: the API reads every configured field from the top level
      // of the body, so custom fields left nested under customFields would come
      // through as missing and fail their "is required" check.
      await api.put('/admin/students/' + student.id, formValues);
      onSaved();
    } catch (error) {
      if (error.response?.status === 401) {
        onUnauthorized();
        return;
      }

      setError(error.response?.data?.message || 'Failed to save changes. Please try again.');
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
      setAdmitResult({ ok: true, message: shortlistedMessage(getStudentDisplayName(student, sections), res.data.matchedProduct) });
      onRefresh();
    } catch (error) {
      if (error.response?.status === 401) {
        onUnauthorized();
        return;
      }

      setAdmitResult({ ok: false, message: error.response?.data?.message || 'Failed to shortlist student.' });
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

                        const isCourseCategory = field.key === 'courseCategory';
                        const literacy = form.computerLiteracy;
                        const autoFilledTitle =
                          field.key === 'courseTitle' && (titlesByCategory.get(form.courseCategory) || []).length === 1;

                        return (
                          <DynamicEditField
                            key={field.key}
                            field={
                              isCourseCategory
                                ? {
                                    ...field,
                                    options: courseCategoryOptions(field, levelByCategory, literacy, student.courseCategory),
                                  }
                                : field
                            }
                            value={readValue(field)}
                            onChange={(value) => writeValue(field, value)}
                            hint={
                              isCourseCategory && literacy
                                ? `Only categories for the ${literacy} level are listed.`
                                : autoFilledTitle
                                ? 'Filled in from the selected course category.'
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <section className="portal-panel p-5">
                <h3 className="text-lg font-semibold text-slate-900">Shortlist</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Shortlist Status</label>
                    <p className="portal-input bg-slate-50 text-slate-600">
                      {ADMISSION_STATUS_LABELS[form.admissionStatus] || form.admissionStatus}
                    </p>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setAdmitConfirmOpen(true)}
                      disabled={form.admissionStatus === 'admitted' || admitLoading}
                      className="portal-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {admitLoading
                        ? 'Shortlisting…'
                        : form.admissionStatus === 'admitted'
                        ? 'Shortlisted'
                        : 'Shortlist'}
                    </button>
                  </div>
                </div>

                {admitResult && (
                  <div
                    className={
                      'mt-4 rounded-2xl border px-4 py-3 text-sm ' +
                      (admitResult.ok
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700')
                    }
                  >
                    {admitResult.message}
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

      {admitConfirmOpen && (
        <Modal
          title="Shortlist Student"
          message={
            `Shortlist ${getStudentDisplayName(student, sections)}? This creates an academic invoice for ` +
            `${student.courseTitle} on the e-invoice site immediately.`
          }
          showCancel
          onClose={() => setAdmitConfirmOpen(false)}
          onConfirm={
            admitLoading
              ? undefined
              : () => {
                  setAdmitConfirmOpen(false);
                  handleAdmit();
                }
          }
        />
      )}
    </div>
  );
}

function ActionsMenu({
  student,
  admitting,
  verifying,
  isOpen,
  onToggle,
  onClose,
  onAdmit,
  onVerify,
  onView,
  onEdit,
  onDelete,
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });

    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [isOpen, onClose]);

  function run(action) {
    action();
    onClose();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className="portal-button-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
      >
        Actions
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: position.top, right: position.right }}
            className="z-50 w-40 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl"
          >
            {/* A student with a payment reference already has an invoice, so
                shortlisting them again would bill them twice. */}
            {student.admissionStatus !== 'admitted' && !student.paymentReference && (
              <button
                type="button"
                onClick={() => run(onAdmit)}
                disabled={admitting}
                className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {admitting ? 'Shortlisting…' : 'Shortlist'}
              </button>
            )}
            {student.paymentReference && (
              <button
                type="button"
                onClick={() => run(onVerify)}
                disabled={verifying}
                className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifying ? 'Verifying…' : 'Verify Status'}
              </button>
            )}
            <button
              type="button"
              onClick={() => run(onView)}
              className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => run(onEdit)}
              className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => run(onDelete)}
              className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

// A search is only checked against the invoice site when it could be a payment
// reference — one token containing a digit — so plain name searches that find
// nothing don't also trigger an invoice site lookup.
function looksLikeReference(query) {
  return /\d/.test(query) && !/\s/.test(query);
}

// How many matches the link search shows at once — it's a picker, not a list to
// browse, so a long list means the search needs narrowing instead.
const LINK_SEARCH_LIMIT = 8;

function InvoiceLookupNotice({ lookup, onLink, onCreate }) {
  if (lookup.loading) {
    return <p className="mt-2 text-xs text-slate-400">Checking the invoice site for this payment reference…</p>;
  }

  if (lookup.error) {
    return <p className="mt-2 text-xs text-red-600">Couldn't check the invoice site: {lookup.error}</p>;
  }

  if (!lookup.found) {
    return (
      <p className="mt-2 text-xs text-slate-400">
        No invoice with this payment reference on the invoice site either. The invoice site only matches the full reference.
      </p>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-md rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Found on the invoice site</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{lookup.name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span>{lookup.reference}</span>
        <StatusBadge value={lookup.status} styles={PAYMENT_BADGE_STYLES} labels={PAYMENT_STATUS_LABELS} />
      </div>
      {lookup.linkedStudent ? (
        <p className="mt-3 text-xs text-slate-500">
          Linked to {lookup.linkedStudent.fullName}, who is hidden by your current filters.
        </p>
      ) : (
        <>
          <p className="mt-3 text-xs text-slate-500">This invoice isn't linked to any student in the portal yet.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onLink} className="portal-button-primary px-4 py-2 text-xs">
              Link to a student
            </button>
            <button type="button" onClick={onCreate} className="portal-button-secondary px-4 py-2 text-xs">
              Create new student
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Lets the admin attach an invoice found on the invoice site to a student who has
// no payment reference yet. The student is found by searching rather than picked
// from the whole roll; the search starts from the name on the invoice.
function LinkReferenceModal({ lookup, sections, onClose, onLinked, onCreateNew, onUnauthorized }) {
  const [searchInput, setSearchInput] = useState(lookup.name || '');
  const [results, setResults] = useState([]);
  const [alreadyLinkedCount, setAlreadyLinkedCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const query = debouncedSearch.trim();

  useEffect(() => {
    if (!query) {
      setResults([]);
      setAlreadyLinkedCount(0);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    api
      .get('/admin/students', { params: { q: query } })
      .then((res) => {
        if (cancelled) return;
        const unlinked = res.data.filter((student) => !student.paymentReference);
        setResults(unlinked.slice(0, LINK_SEARCH_LIMIT));
        setAlreadyLinkedCount(res.data.length - unlinked.length);
        setSearching(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setSearching(false);
        if (error.response?.status === 401) {
          onUnauthorized();
          return;
        }
        setError('Failed to search students. Please try again.');
      });

    return () => {
      cancelled = true;
    };
  }, [query, onUnauthorized]);

  async function handleLink() {
    setSaving(true);
    setError('');
    try {
      const res = await api.put(`/admin/students/${selected.id}/payment-reference`, { reference: lookup.reference });
      onLinked(res.data.student);
    } catch (error) {
      if (error.response?.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error.response?.data?.message || 'Failed to link the payment reference. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-lg overflow-hidden p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Link Payment Reference</h2>
        <p className="mt-2 text-sm text-slate-600">
          Link <span className="font-semibold">{lookup.reference}</span> (invoiced to {lookup.name}) to a student who
          doesn't have a payment reference yet.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search for the student</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSelected(null);
            }}
            placeholder="Search by name, email, or phone…"
            className="portal-input"
          />

          <div className="mt-3 max-h-64 overflow-y-auto">
            {!query ? (
              <p className="text-sm text-slate-500">Type a name, email, or phone number to find the student.</p>
            ) : searching ? (
              <p className="text-sm text-slate-500">Searching…</p>
            ) : results.length === 0 ? (
              <div className="text-sm text-slate-500">
                <p>
                  No student without a payment reference matches "{query}".
                  {alreadyLinkedCount > 0 && ' Students matching this search already have one.'}
                </p>
                <button type="button" onClick={onCreateNew} className="portal-button-secondary mt-3 px-4 py-2 text-xs">
                  Create new student instead
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((student) => {
                  const isSelected = selected?.id === student.id;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelected(student)}
                      className={
                        'rounded-2xl border px-4 py-3 text-left transition ' +
                        (isSelected
                          ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-slate-100 bg-slate-50/80 hover:border-blue-200 hover:bg-blue-50/40')
                      }
                    >
                      <p className="text-sm font-semibold text-slate-900">{getStudentDisplayName(student, sections)}</p>
                      <p className="text-xs text-slate-500">
                        {student.emailAddress} · {student.phoneNumber}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="portal-button-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLink}
            disabled={!selected || saving}
            className="portal-button-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Linking…' : 'Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Registers a student for an invoice that exists on the invoice site but has no
// record here, then links the reference to the new student. Only the name is
// known from the invoice, so the rest of the registration form has to be filled
// in as usual.
function CreateStudentModal({ lookup, sections, levelByCategory, titlesByCategory, onClose, onCreated, onUnauthorized }) {
  const [values, setValues] = useState(() => ({ ...getDefaultValues(sections), fullName: lookup.name || '' }));
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    let student;
    try {
      const res = await api.post('/register', values);
      student = res.data.student;
    } catch (error) {
      setSaving(false);
      if (error.response?.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error.response?.data?.message || 'Failed to create the student. Please try again.');
      setFieldErrors(error.response?.data?.fieldErrors || {});
      return;
    }

    // The student now exists, so a failure here is reported as a warning rather
    // than an error — re-submitting would only fail on the duplicate email.
    try {
      const res = await api.put(`/admin/students/${student.id}/payment-reference`, { reference: lookup.reference });
      onCreated(res.data.student);
    } catch (error) {
      onCreated(
        student,
        `${getStudentDisplayName(student, sections)} was created, but linking ${lookup.reference} failed: ` +
          `${error.response?.data?.message || 'please try again'}. Search for the reference again to link it.`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-5xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">New registration</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create Student</h2>
          </div>
          <button type="button" onClick={onClose} className="portal-button-secondary px-4 py-2">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[72vh] overflow-y-auto px-6 py-6">
            <div className="grid gap-5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Payment reference <span className="font-semibold">{lookup.reference}</span> (invoiced to {lookup.name})
                is linked to this student once they're created.
              </div>

              {sections.map((section) => (
                <section key={section.key} className="portal-panel p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {sortByOrder(section.fields || []).map((field) => {
                      if (!isFieldVisible(field, values)) return null;

                      const isCourseCategory = field.key === 'courseCategory';
                      const literacy = values.computerLiteracy;

                      return (
                        <DynamicEditField
                          key={field.key}
                          field={
                            isCourseCategory
                              ? { ...field, options: courseCategoryOptions(field, levelByCategory, literacy, '') }
                              : field
                          }
                          value={values[field.key]}
                          onChange={(value) =>
                            setValues((prev) => ({
                              ...prev,
                              [field.key]: value,
                              ...(isCourseCategory
                                ? { courseTitle: titleForCategory(value, titlesByCategory, prev.courseTitle) }
                                : {}),
                            }))
                          }
                          hint={
                            isCourseCategory && literacy
                              ? `Only categories for the ${literacy} level are listed.`
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p>{error}</p>
                  {Object.keys(fieldErrors).length > 1 && (
                    <ul className="mt-2 list-inside list-disc">
                      {Object.entries(fieldErrors).map(([key, message]) => (
                        <li key={key}>{message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/60 px-6 py-5">
            <button type="button" onClick={onClose} className="portal-button-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="portal-button-primary">
              {saving ? 'Creating…' : 'Create and Link'}
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
  const locations = useCourseLocations();
  const levelByCategory = useCourseLevels();

  // Course titles available per category, used to fill the course title in once a
  // category is chosen.
  const titlesByCategory = courses.reduce((map, course) => {
    map.set(course.category, [...(map.get(course.category) || []), course.title]);
    return map;
  }, new Map());
  const filterCourseCategories = [...courses.map((course) => course.category), 'Other'];

  const [students, setStudents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page, setPage] = useState(1);
  const [admittingId, setAdmittingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [admitConfirm, setAdmitConfirm] = useState(null);

  const [successModal, setSuccessModal] = useState('');

  const [invoiceLookup, setInvoiceLookup] = useState(null);
  const [linkLookup, setLinkLookup] = useState(null);
  const [createLookup, setCreateLookup] = useState(null);

  const [formSections, setFormSections] = useState([]);

  const debouncedSearch = useDebounce(searchInput, 300);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const { formConfig } = useFormConfig('/admin/form-config', { onUnauthorized: handleUnauthorizedAccess });

  useEffect(() => {
    if (!formConfig) return;
    const enabled = (formConfig.sections || [])
      .filter((section) => section.enabled)
      .map((section) => ({ ...section, fields: (section.fields || []).filter((field) => field.enabled) }));
    setFormSections(sortByOrder(enabled));
  }, [formConfig]);

  // Keys already surfaced through the combined Name column (see
  // getStudentDisplayName) — excluded from the Details column below so a
  // split-out Last/Other Names field isn't shown twice.
  const nameFieldKeys = new Set(getPersonalNameFields(formSections).map((field) => field.key));

  // Any custom field an admin adds via the form builder lands here
  // automatically — no table code changes needed to surface it.
  const extraFieldsBySection = formSections.map((section) => ({
    ...section,
    fields: sortByOrder(section.fields || []).filter((field) => !field.isBuiltIn && !nameFieldKeys.has(field.key)),
  }));

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

  // When a search finds no student, it may be a payment reference the portal has
  // no record of (an invoice created directly on the invoice site), so ask the
  // invoice site about it.
  useEffect(() => {
    const reference = debouncedSearch.trim();
    if (loading || students.length > 0 || !looksLikeReference(reference)) {
      setInvoiceLookup(null);
      return;
    }

    let cancelled = false;
    setInvoiceLookup({ loading: true });

    api
      .get('/admin/invoice-lookup', { params: { reference } })
      .then((res) => {
        if (!cancelled) setInvoiceLookup(res.data);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.response?.status === 401) {
          handleUnauthorizedAccess();
          return;
        }
        setInvoiceLookup({ error: error.response?.data?.message || 'Please try again.' });
      });

    return () => {
      cancelled = true;
    };
  }, [loading, students.length, debouncedSearch, handleUnauthorizedAccess]);

  function handleReferenceLinked(student) {
    setSuccessModal(
      `Linked payment reference ${student.paymentReference} to ${getStudentDisplayName(student, formSections)}.`
    );
    setLinkLookup(null);
    fetchStudents();
  }

  function handleStudentCreated(student, warning) {
    setCreateLookup(null);
    if (warning) {
      setFetchError(warning);
    } else {
      setSuccessModal(
        `Created ${getStudentDisplayName(student, formSections)} and linked payment reference ${student.paymentReference}.`
      );
    }
    fetchStudents();
  }

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

  async function handleAdmit(student) {
    setAdmittingId(student.id);
    try {
      const res = await api.post('/admin/students/' + student.id + '/admit');
      setAdmitConfirm(null);
      setSuccessModal(shortlistedMessage(getStudentDisplayName(student, formSections), res.data.matchedProduct));
      fetchStudents();
    } catch (error) {
      setAdmitConfirm(null);

      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }

      setFetchError(error.response?.data?.message || 'Failed to shortlist student. Please try again.');
    } finally {
      setAdmittingId(null);
    }
  }

  // Merges verified statuses into the loaded list instead of refetching, which
  // would jump back to page 1 and clear the selection.
  function applyPaymentStatuses(results) {
    const statusById = new Map(results.filter((result) => result.status).map((result) => [result.id, result.status]));
    setStudents((prev) =>
      prev.map((student) =>
        statusById.has(student.id) ? { ...student, paymentStatus: statusById.get(student.id) } : student
      )
    );
  }

  async function handleVerify(student) {
    setVerifyingId(student.id);
    setFetchError('');
    try {
      const res = await api.post('/admin/students/verify-payment', { ids: [student.id] });
      applyPaymentStatuses(res.data.results);

      const name = getStudentDisplayName(student, formSections);
      const status = res.data.results[0]?.status;
      if (status) {
        setSuccessModal(`Payment status for ${name} (${student.paymentReference}): ${paymentStatusLabel(status)}.`);
      } else {
        setFetchError(`Payment reference ${student.paymentReference} for ${name} was not found on the invoice site.`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }

      setFetchError(error.response?.data?.message || 'Failed to verify payment status. Please try again.');
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleBulkVerify() {
    setBulkLoading(true);
    setFetchError('');
    try {
      const res = await api.post('/admin/students/verify-payment', { ids: Array.from(selectedIds) });
      const { results, skipped } = res.data;
      applyPaymentStatuses(results);

      const countByStatus = {};
      results
        .filter((result) => result.status)
        .forEach((result) => {
          countByStatus[result.status] = (countByStatus[result.status] || 0) + 1;
        });
      const found = Object.values(countByStatus).reduce((total, count) => total + count, 0);
      const breakdown = Object.entries(countByStatus)
        .map(([status, count]) => `${count} ${paymentStatusLabel(status)}`)
        .join(', ');
      const notFound = results.length - found;

      setSuccessModal(
        [
          `Verified ${found} payment reference(s)` + (breakdown ? `: ${breakdown}.` : '.'),
          notFound > 0 ? `${notFound} were not found on the invoice site.` : '',
          skipped > 0 ? `${skipped} selected student(s) have no payment reference yet.` : '',
        ]
          .filter(Boolean)
          .join(' ')
      );
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setFetchError(error.response?.data?.message || 'Failed to verify payment statuses. Please try again.');
    } finally {
      setBulkLoading(false);
    }
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

      const summary =
        `Shortlisted and invoiced ${res.data.shortlisted} student(s).` +
        (res.data.alreadyShortlisted > 0 ? ` ${res.data.alreadyShortlisted} were already shortlisted.` : '');

      // Group failures by reason so one broken course or invoice-site error reads
      // as a single line rather than repeating for every student it affected.
      const failuresByReason = {};
      res.data.results
        .filter((result) => result.status === 'failed')
        .forEach((result) => {
          const student = students.find((entry) => entry.id === result.id);
          const name = student ? getStudentDisplayName(student, formSections) : `#${result.id}`;
          (failuresByReason[result.message] ||= []).push(name);
        });

      if (res.data.failed > 0) {
        const reasons = Object.entries(failuresByReason)
          .map(([reason, names]) => `${names.join(', ')}: ${reason}`)
          .join(' ');
        setFetchError(`${summary} ${res.data.failed} could not be shortlisted. ${reasons}`);
      } else {
        setSuccessModal(summary);
      }

      fetchStudents();
    } catch (error) {
      setBulkConfirm(null);
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setFetchError('Failed to shortlist the selected students. Please try again.');
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

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getExtraFieldEntries(student) {
    return extraFieldsBySection
      .flatMap((section) => section.fields.map((field) => ({ field, value: student.customFields?.[field.key] })))
      .filter(({ value }) => value !== undefined && value !== null && String(value).trim() !== '');
  }

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
              Search the full registration database by name, email, phone, course category, or payment reference, then
              refine with filters.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, phone, course category, or payment reference…"
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
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Shortlist status</label>
                  <select
                    value={filters.admissionStatus}
                    onChange={(e) => updateFilter('admissionStatus', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="admitted">Shortlisted</option>
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
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-600">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="portal-select"
                  >
                    <option value="">All</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
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
                Shortlist Selected
              </button>
              <button
                type="button"
                onClick={handleBulkVerify}
                disabled={bulkLoading}
                className="portal-button-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Verify Status
              </button>
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
                  <th className="px-3 py-4 font-semibold">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((student) => selectedIds.has(student.id))}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all students on this page"
                    />
                  </th>
                  <th className="px-3 py-4 font-semibold">Student</th>
                  <th className="px-3 py-4 font-semibold">Course Category</th>
                  <th className="px-3 py-4 font-semibold">Details</th>
                  <th className="px-3 py-4 font-semibold">Status</th>
                  <th className="px-3 py-4 font-semibold">Payment Ref</th>
                  <th className="px-3 py-4 font-semibold">Registered</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">Loading…</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      {searchInput || activeFilterCount > 0 ? 'No students match your search or filters.' : 'No students registered yet.'}
                      {invoiceLookup && (
                        <InvoiceLookupNotice
                          lookup={invoiceLookup}
                          onLink={() => setLinkLookup(invoiceLookup)}
                          onCreate={() => setCreateLookup(invoiceLookup)}
                        />
                      )}
                    </td>
                  </tr>
                ) : (
                  paginated.map((student) => {
                    const displayName = getStudentDisplayName(student, formSections);
                    const extraFields = getExtraFieldEntries(student);
                    return (
                    <tr key={student.id} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(student.id)}
                          onChange={() => toggleSelectOne(student.id)}
                          aria-label={`Select ${displayName}`}
                        />
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        <div className="flex max-w-[200px] flex-col gap-0.5">
                          <p className="truncate font-semibold text-slate-900" title={displayName}>
                            {displayName}
                          </p>
                          <p className="truncate text-xs" title={`Email: ${student.emailAddress}`}>
                            <span className="font-medium text-slate-500">Email:</span> {student.emailAddress}
                          </p>
                          <p className="truncate text-xs" title={`Phone: ${student.phoneNumber}`}>
                            <span className="font-medium text-slate-500">Phone:</span> {student.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        <p className="max-w-[130px] truncate" title={student.courseCategory}>
                          {student.courseCategory}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {extraFields.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex max-w-[200px] flex-col gap-0.5">
                            {extraFields.map(({ field, value }) => (
                              <p key={field.key} className="truncate text-xs" title={`${field.label}: ${value}`}>
                                <span className="font-medium text-slate-500">{field.label}:</span>{' '}
                                {String(value)}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge value={student.admissionStatus} styles={ADMISSION_BADGE_STYLES} labels={ADMISSION_STATUS_LABELS} />
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {student.paymentReference ? (
                          <div className="flex flex-col items-start gap-1">
                            <p className="max-w-[140px] truncate text-xs font-medium" title={student.paymentReference}>
                              {student.paymentReference}
                            </p>
                            {student.paymentStatus && (
                              <StatusBadge
                                value={student.paymentStatus}
                                styles={PAYMENT_BADGE_STYLES}
                                labels={PAYMENT_STATUS_LABELS}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-slate-600">{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-4">
                        <ActionsMenu
                          student={student}
                          admitting={admittingId === student.id}
                          verifying={verifyingId === student.id}
                          isOpen={openMenuId === student.id}
                          onToggle={() => setOpenMenuId((prev) => (prev === student.id ? null : student.id))}
                          onClose={() => setOpenMenuId(null)}
                          onAdmit={() => setAdmitConfirm(student)}
                          onVerify={() => handleVerify(student)}
                          onView={() => setViewStudent(student)}
                          onEdit={() => setEditStudent(student)}
                          onDelete={() => setDeleteStudent(student)}
                        />
                      </td>
                    </tr>
                    );
                  })
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
          levelByCategory={levelByCategory}
          titlesByCategory={titlesByCategory}
          onClose={() => setEditStudent(null)}
          onSaved={handleEditSaved}
          onUnauthorized={handleUnauthorizedAccess}
          onRefresh={fetchStudents}
        />
      )}

      {deleteStudent && (
        <Modal
          title="Delete Student"
          message={'Are you sure you want to delete ' + getStudentDisplayName(deleteStudent, formSections) + '? This action cannot be undone.'}
          showCancel
          onClose={() => setDeleteStudent(null)}
          onConfirm={deleteLoading ? undefined : handleDelete}
        />
      )}

      {admitConfirm && (
        <Modal
          title="Shortlist Student"
          message={
            `Shortlist ${getStudentDisplayName(admitConfirm, formSections)}? This creates an academic invoice for ` +
            `${admitConfirm.courseTitle} on the e-invoice site immediately.`
          }
          showCancel
          onClose={() => setAdmitConfirm(null)}
          onConfirm={admittingId === admitConfirm.id ? undefined : () => handleAdmit(admitConfirm)}
        />
      )}

      {bulkConfirm === 'admit' && (
        <Modal
          title="Shortlist Selected Students"
          message={
            `Shortlist ${selectedIds.size} student(s)? An academic invoice is created on the e-invoice site for ` +
            'each one immediately. Students who are already shortlisted are skipped.'
          }
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

      {linkLookup && (
        <LinkReferenceModal
          lookup={linkLookup}
          sections={formSections}
          onClose={() => setLinkLookup(null)}
          onLinked={handleReferenceLinked}
          onCreateNew={() => {
            setCreateLookup(linkLookup);
            setLinkLookup(null);
          }}
          onUnauthorized={handleUnauthorizedAccess}
        />
      )}

      {createLookup && (
        <CreateStudentModal
          lookup={createLookup}
          sections={formSections}
          levelByCategory={levelByCategory}
          titlesByCategory={titlesByCategory}
          onClose={() => setCreateLookup(null)}
          onCreated={handleStudentCreated}
          onUnauthorized={handleUnauthorizedAccess}
        />
      )}

      {successModal && <Modal title="Success" message={successModal} onClose={() => setSuccessModal('')} />}
    </div>
  );
}
