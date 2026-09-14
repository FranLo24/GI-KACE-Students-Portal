import { NavLink, Outlet } from 'react-router-dom';
import { useUnauthorizedRedirect } from '../hooks/useUnauthorizedRedirect';
import logo from '../assets/gikace-logo.png';

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
      'rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
      isActive
        ? 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-white shadow-lg shadow-gold-200/60'
        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700',
    ].join(' ');

  return (
    <div className="portal-shell min-h-screen">
      <div className="sticky top-0 z-40">
        <div className="bg-brand-600 text-slate-100">
          <div className="portal-container flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
            <p className="font-semibold uppercase tracking-[0.28em] text-gold-300">Admin Portal</p>
            <p className="text-slate-200/80">Registration operations workspace</p>
          </div>
        </div>

        <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-xl">
          <div className="portal-container flex flex-wrap items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="GI-KACE logo" className="h-12 w-auto" />
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-blue-700">Admin Portal</p>
                <p className="text-sm text-slate-500">Manage registrations, courses, and settings</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <button type="button" onClick={handleLogout} className="portal-button-secondary px-4 py-2 text-xs">
              Logout
            </button>
          </div>
        </nav>
      </div>

      <main className="portal-container py-8 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
