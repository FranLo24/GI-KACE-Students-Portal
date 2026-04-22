import { Link } from 'react-router-dom';
import logo from '../assets/gikace-logo.png';

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/60 bg-slate-950 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(240, 228, 12, 0.2),transparent_24%)]" />
      <div className="portal-container relative z-10 grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <img src={logo} alt="GI-KACE logo" className="h-16 w-auto rounded-3xl bg-white/90 p-2" />
          <div>
            <p className="max-w-xl text-sm text-slate-300">
              The Ghana-India Kofi Annan Centre of Excellence in ICT
            </p>
          </div>
        </div>

        <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2 md:text-right">
          <div>
            <p className="font-semibold text-white">Portal Links</p>
            <div className="mt-2 space-y-2">
              <p><Link to="/" className="transition hover:text-blue-300">Home</Link></p>
              <p><Link to="/register" className="transition hover:text-blue-300">Register</Link></p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <div className="mt-2 space-y-2">
              <p>info@gikace.org</p>
              <p>+233 000 000 000</p>
              <p>&copy; {new Date().getFullYear()} GI-KACE</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
