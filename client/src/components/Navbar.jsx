import { NavLink } from 'react-router-dom';
import logo from '../assets/gikace-logo.png';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-medium transition duration-300',
      isActive
        ? 'bg-gradient-to-r from-rose-500 via-red-500 to-blue-600 text-white shadow-lg shadow-rose-200/60'
        : 'text-slate-700 hover:bg-white hover:text-rose-700',
    ].join(' ');

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="portal-container flex flex-wrap items-center justify-between gap-4 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="GI-KACE logo"
            className="h-12 w-auto rounded-2xl bg-white/80 p-1 shadow-lg shadow-slate-200/60 transition duration-300 hover:scale-[1.02]"
          />
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-rose-700">
              Students Portal
            </p>
            <p className="text-sm text-slate-500">Apply for ICT programmes with a clear, guided flow</p>
          </div>
        </NavLink>

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-full border border-white/70 bg-white/70 p-1.5 shadow-lg shadow-slate-200/50">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/register" className={linkClass}>
            Register
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
