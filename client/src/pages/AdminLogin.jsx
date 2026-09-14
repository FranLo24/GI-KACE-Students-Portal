import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import adminVisual from '../assets/admin-login-visual.png';
import logo from '../assets/gikace-logo.png';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      login(res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <div className="bg-brand-600 text-slate-100">
        <div className="portal-container flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
          <p className="font-semibold uppercase tracking-[0.28em] text-gold-300">Admin Portal</p>
          <p className="text-slate-200/80">GI-KACE Students Registration Portal</p>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="portal-container flex items-center gap-3 py-3">
          <img src={logo} alt="GI-KACE logo" className="h-12 w-auto" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-blue-700">Students Portal</p>
            <p className="text-sm text-slate-500">Admin sign-in</p>
          </div>
        </div>
      </div>

      <main className="portal-container flex flex-1 items-center py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <section className="glass-panel animate-rise-in relative overflow-hidden p-3">
            <img
              src={adminVisual}
              alt="Modern education administration workspace"
              className="h-full min-h-[320px] w-full rounded-[24px] object-cover"
            />
            <div className="absolute inset-x-6 bottom-6 rounded-[24px] border border-white/35 bg-slate-950/50 p-6 text-white backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">Admin command center</p>
              <h1 className="mt-3 text-3xl font-semibold text-blue-700">Manage registrations from one focused admin dashboard.</h1>
              <p className="mt-3 max-w-xl text-sm text-slate-200/90">
                Search student records, review submissions, update details, and keep admissions activity organised in one place.
              </p>
            </div>
          </section>

          <section className="portal-panel animate-rise-in p-6 sm:p-8 lg:p-10">
            <span className="portal-kicker">Secure access</span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Admin Login</h2>
            <p className="mt-3 text-sm text-slate-600">
              Sign in to review student submissions, edit registration details, and manage the portal experience.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="portal-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="portal-input"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="portal-button-primary w-full">
                {loading ? 'Signing in…' : 'Access Dashboard'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
