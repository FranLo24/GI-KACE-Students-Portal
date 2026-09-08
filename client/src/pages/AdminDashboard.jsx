import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import dashboardBanner from '../assets/dashboard-banner.png';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';

export default function AdminDashboard() {
  const handleUnauthorizedAccess = useUnauthorizedRedirect();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorizedAccess();
        return;
      }

      setFetchError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorizedAccess]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
    <div className="space-y-8">
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
              <p className="text-3xl font-semibold text-slate-900">{loading ? '—' : students.length}</p>
              <p className="mt-1 text-sm text-slate-500">Total registrations</p>
            </div>
            <div className="portal-data-card">
              <p className="text-3xl font-semibold text-slate-900">{loading ? '—' : todayRegistrations}</p>
              <p className="mt-1 text-sm text-slate-500">Registered today</p>
            </div>
            <div className="portal-data-card">
              <p className="text-3xl font-semibold text-slate-900">{loading ? '—' : activeCourses}</p>
              <p className="mt-1 text-sm text-slate-500">Active course categories</p>
            </div>
          </div>
        </div>

        <div className="glass-panel animate-float-soft overflow-hidden p-3">
          <img src={dashboardBanner} alt="Analytics and student management workspace" className="h-[360px] w-full rounded-[24px] object-cover" />
        </div>
      </section>

      {fetchError && (
        <div className="portal-panel border border-blue-100 bg-blue-50 px-6 py-4 text-sm text-blue-700">{fetchError}</div>
      )}

      <div className="portal-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Top categories</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {topCategories.length === 0 ? (
            <p className="text-sm text-slate-500 sm:col-span-3">Categories will appear here after registrations are submitted.</p>
          ) : (
            topCategories.map(([name, count]) => (
              <div key={name} className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{name}</p>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
