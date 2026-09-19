import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';
import { formatFee } from '../utils/currency';

// Courses, their prices and the centres they run at all come from the invoice
// site, so this panel only shows what the last sync brought in — the sync is the
// single way the catalogue changes. Courses created by hand before the portal
// moved to invoice-only courses stay in the database with their students, but are
// no longer part of the catalogue and aren't listed here.
function locationFeesSummary(locationFees) {
  if (!locationFees || locationFees.length === 0) return 'No prices synced yet';
  return locationFees.map((entry) => `${entry.location} ${formatFee(entry.fee)}`).join(' · ');
}

function CourseRow({ course }) {
  const invoiceLinked = (course.locationFees || []).some((entry) => entry.invoiceProductId);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{course.title}</p>
          <p className="text-xs text-slate-500">{course.category}</p>
          <p className="mt-1 text-xs text-slate-500">{locationFeesSummary(course.locationFees)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!invoiceLinked && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Not invoiceable
            </span>
          )}
          <span
            className={
              'rounded-full px-2.5 py-1 text-xs font-semibold ' +
              (course.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')
            }
          >
            {course.enabled ? 'Live' : 'Hidden'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CourseManagementPanel() {
  const handleUnauthorizedAccess = useUnauthorizedRedirect();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorizedAccess]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function syncFromInvoice() {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.post('/admin/courses/sync');
      setSyncMessage(res.data.message);
      await fetchCourses();
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }
      setSyncMessage(err.response?.data?.message || 'Failed to sync courses from the invoice site.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 6000);
    }
  }

  return (
    <div className="portal-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Course catalogue</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Courses</h2>
          <p className="mt-2 text-sm text-slate-500">
            Courses and their prices come from the invoice site. Sync to pull in the latest catalogue — it appears
            immediately on the homepage and registration form.
          </p>
        </div>
        <button
          type="button"
          onClick={syncFromInvoice}
          disabled={syncing}
          className="portal-button-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? 'Syncing…' : 'Sync from Invoice'}
        </button>
      </div>

      {syncMessage && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {syncMessage}
        </div>
      )}

      {error && <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-500">
            No courses have been synced yet. Use "Sync from Invoice" to pull the catalogue from the invoice site.
          </p>
        ) : (
          courses.map((course) => <CourseRow key={course.id} course={course} />)
        )}
      </div>
    </div>
  );
}
