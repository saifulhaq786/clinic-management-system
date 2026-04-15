import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogIn, ShieldCheck } from 'lucide-react';
import api from './api';
import AuthShell from './components/AuthShell';
import GoogleAuthButton from './components/GoogleAuthButton';
import { persistSession } from './authSession';

export default function Login() {
  const [coords, setCoords] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ type: 'Point', coordinates: [p.coords.longitude, p.coords.latitude] }),
      () => console.log("Location access denied. Some features may be limited.")
    );
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        location: coords
      });
      persistSession(res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure Sign In"
      title="Access a refined clinical workspace built for trust."
      description="Sign in to continue managing appointments, records, conversations, and billing in one premium care platform."
    >
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl border border-teal-400/10 bg-teal-400/[0.06] p-3 text-teal-300">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-teal-300/70 uppercase">Welcome Back</p>
          <h2 className="mt-0.5 text-2xl font-semibold text-white">Sign in to your account</h2>
        </div>
      </div>

      {/* Error / Status */}
      {error && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
          error.includes('resent') ? 'border-emerald-400/15 bg-emerald-500/[0.06] text-emerald-300' : 'border-red-400/15 bg-red-500/[0.06] text-red-300'
        }`}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Email</label>
          <input
            type="email"
            placeholder="name@eliteclinic.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2"
        >
          {loading ? 'Signing In...' : <><LogIn size={17} /> Sign In</>}
        </button>
      </form>

      {/* Google */}
      <div className="mt-6">
        <GoogleAuthButton setError={setError} location={coords} role={null} />
      </div>

      {/* Links */}
      <div className="mt-8 space-y-4 text-sm">
        <button
          type="button"
          onClick={() => navigate('/mobile-login')}
          className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-left transition-all duration-200 hover:border-teal-400/20 hover:bg-white/[0.04]"
        >
          <span>
            <span className="block font-medium text-white">Sign in with mobile OTP</span>
            <span className="block text-slate-400 text-[0.8rem] mt-0.5">Receive a one-time code on your phone.</span>
          </span>
          <ChevronRight size={16} className="text-teal-300/60" />
        </button>

        <p className="text-center text-slate-500">
          New to Elite Clinic?{' '}
          <button type="button" onClick={() => navigate('/signup')} className="font-medium text-teal-300 transition hover:text-teal-200">
            Create an account
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
