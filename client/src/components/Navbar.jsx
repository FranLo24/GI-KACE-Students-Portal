import logo from '../assets/gikace-logo.png';

export default function Navbar() {
  return (
    <div className="sticky top-0 z-40">
      <div className="bg-brand-600 text-slate-100">
        <div className="portal-container flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <a href="mailto:info@gi-kace.gov.gh" className="flex items-center gap-1.5 hover:text-gold-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2.94 6.94A2 2 0 014.5 6h11a2 2 0 011.56.94L10 11.4 2.94 6.94zM2 8.12V14a2 2 0 002 2h12a2 2 0 002-2V8.12l-7.6 4.75a1 1 0 01-1.06 0L2 8.12z" />
              </svg>
              info@gi-kace.gov.gh
            </a>
            <a href="tel:+233556660355" className="flex items-center gap-1.5 hover:text-gold-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Accra +233 55 666 0355
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="hover:text-gold-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.79-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-gold-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 5.9c-.7.32-1.5.54-2.3.64a4 4 0 001.75-2.2 8 8 0 01-2.54.97 4 4 0 00-6.8 3.65A11.34 11.34 0 013.14 4.9a4 4 0 001.24 5.34 4 4 0 01-1.8-.5v.05a4 4 0 003.2 3.92 4 4 0 01-1.8.07 4 4 0 003.73 2.78A8 8 0 012 18.57 11.3 11.3 0 008.29 20.5c7.55 0 11.68-6.26 11.68-11.69 0-.18 0-.35-.01-.53A8.3 8.3 0 0022 5.9z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-gold-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.25.64.42 1.37.47 2.43C21.99 8.94 22 9.28 22 12s-.01 3.06-.06 4.12a7.6 7.6 0 01-.47 2.43 4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.64.25-1.37.42-2.43.47C15.06 21.99 14.72 22 12 22s-3.06-.01-4.12-.06a7.6 7.6 0 01-2.43-.47 4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77 7.6 7.6 0 01-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 015.45.53c.64-.25 1.37-.42 2.43-.47C8.94.01 9.28 0 12 0zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.17 1.17 0 100-2.33 1.17 1.17 0 000 2.33z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="portal-container flex flex-wrap items-center gap-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GI-KACE logo" className="h-14 w-auto" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-blue-700">Students Portal</p>
              <p className="text-sm text-slate-500">Apply for ICT programmes with a clear, guided flow</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
