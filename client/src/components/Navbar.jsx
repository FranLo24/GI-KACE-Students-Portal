import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm font-medium transition ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-700 font-bold text-xl">GI-KACE</span>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/register" className={linkClass}>Register</NavLink>
          <NavLink to="/admin/login" className={linkClass}>Admin Login</NavLink>
        </div>
      </div>
    </nav>
  );
}
