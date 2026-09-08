import { NavLink, Outlet } from 'react-router-dom';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';

const NAV_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/dashboard/students', label: 'Students' },
  { to: '/admin/dashboard/course-recommendations', label: 'Course Recommendations' },
  { to: '/admin/dashboard/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const handleLogout = useUnauthorizedRedirect();

  const linkClass = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-medium transition duration-300',
      isActive
        ? 'bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/60'
        : 'text-slate-700 hover:bg-white hover:text-blue-700',
    ].join(' ');

  return (
    <div className="portal-shell min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="portal-container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-700">Admin portal</p>
            <p className="text-sm text-slate-500">Registration operations workspace</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1.5 shadow-lg shadow-slate-200/50">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="portal-button-secondary text-blue-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="portal-container py-8 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
