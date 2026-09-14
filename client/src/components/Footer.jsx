import logo from '../assets/gikace-logo.png';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: '#',
    path: 'M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.79-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z',
  },
  {
    label: 'Twitter',
    href: '#',
    path: 'M22 5.9c-.7.32-1.5.54-2.3.64a4 4 0 001.75-2.2 8 8 0 01-2.54.97 4 4 0 00-6.8 3.65A11.34 11.34 0 013.14 4.9a4 4 0 001.24 5.34 4 4 0 01-1.8-.5v.05a4 4 0 003.2 3.92 4 4 0 01-1.8.07 4 4 0 003.73 2.78A8 8 0 012 18.57 11.3 11.3 0 008.29 20.5c7.55 0 11.68-6.26 11.68-11.69 0-.18 0-.35-.01-.53A8.3 8.3 0 0022 5.9z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.25.64.42 1.37.47 2.43C21.99 8.94 22 9.28 22 12s-.01 3.06-.06 4.12a7.6 7.6 0 01-.47 2.43 4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.64.25-1.37.42-2.43.47C15.06 21.99 14.72 22 12 22s-3.06-.01-4.12-.06a7.6 7.6 0 01-2.43-.47 4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77 7.6 7.6 0 01-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 015.45.53c.64-.25 1.37-.42 2.43-.47C8.94.01 9.28 0 12 0zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.17 1.17 0 100-2.33 1.17 1.17 0 000 2.33z',
  },
];

const QUICK_LINKS = ['About Us', 'Training', 'Our Innovation Projects', 'Enquiries'];

function ChevronIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-gold-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.05 4.05a.75.75 0 011.06 0l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06L11.44 9.5 7.05 5.11a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001c.02.01.038.019.054.026a.99.99 0 00.44.108c.055 0 .11-.006.164-.017l.01-.002.023-.005a1.7 1.7 0 00.194-.06c.156-.06.373-.157.626-.297.507-.28 1.176-.72 1.849-1.34 1.339-1.235 2.71-3.164 2.71-5.8a5.75 5.75 0 10-11.5 0c0 2.636 1.371 4.565 2.71 5.8.673.62 1.342 1.06 1.849 1.34.253.14.47.237.626.297.078.03.144.05.194.06zM10 11.5a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gold-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gold-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2.94 6.94A2 2 0 014.5 6h11a2 2 0 011.56.94L10 11.4 2.94 6.94zM2 8.12V14a2 2 0 002 2h12a2 2 0 002-2V8.12l-7.6 4.75a1 1 0 01-1.06 0L2 8.12z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-brand-600 text-slate-100">
        <div className="portal-container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="GI-KACE logo" className="h-12 w-12 rounded-lg bg-white object-contain p-1.5" />
              <p className="text-2xl font-bold text-white">GI-KACE</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-100/90">
              The core aim of the Centre is to promote individual and institutional capacity building; research and
              innovation; consultancy and advisory services in the area of ICT
            </p>
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 text-gold-300 transition hover:bg-gold-500 hover:text-brand-900"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold text-white">Quick Links</p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {QUICK_LINKS.map((label) => (
                <a key={label} href="#" className="flex items-center gap-2 text-slate-100/90 transition hover:text-gold-300">
                  <ChevronIcon />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold text-white">Contact Us</p>
            <div className="mt-5 space-y-4 text-sm text-slate-100/90">
              <div className="flex items-start gap-3">
                <PinIcon />
                <span>
                  Haile Selassie St., opp. Council of State, PMB, State House, Accra – Ghana Digital Address:
                  GA-079-3146
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon />
                <a href="tel:+233556660355" className="hover:text-gold-300">
                  Accra +233 55 666 0355
                </a>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon />
                <a href="mailto:info@gi-kace.gov.gh" className="hover:text-gold-300">
                  info@gi-kace.gov.gh
                </a>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xl font-semibold text-white">Newsletter</p>
            <a href="#" className="portal-button-primary mt-5 inline-flex">
              Download Our Newsletter
            </a>
          </div>
        </div>
      </div>

      <div className="bg-brand-900 py-4 text-center text-xs text-slate-300">
        <p>&copy; {new Date().getFullYear()} GI-KACE. All rights reserved.</p>
      </div>
    </footer>
  );
}
