import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogIn, ShieldCheck } from 'lucide-react';
import api from './api';
import AuthShell from './components/AuthShell';
import GoogleAuthButton from './components/GoogleAuthButton';
import EmailVerificationModal from './EmailVerificationModal';
import { persistSession } from './authSession';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      persistSession(res.data);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setVerificationEmail(err.response.data.email || email);
        setShowVerificationModal(true);
      }
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">Welcome Back</p>
          <h2 className="mt-1 text-3xl font-semibold text-white">Sign in to Elite Clinic</h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Email</label>
          <input
            type="email"
            placeholder="name@eliteclinic.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing In...' : <><LogIn size={18} /> Sign In</>}
        </button>
      </form>

      <div className="mt-6">
        <GoogleAuthButton setError={setError} />
      </div>

      <div className="mt-8 space-y-4 text-sm text-slate-300">
        <button
          type="button"
          onClick={() => navigate('/mobile-login')}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-cyan-300/40 hover:bg-white/10"
        >
          <span>
            <span className="block font-semibold text-white">Use mobile OTP instead</span>
            <span className="block text-slate-400">Access your account with verified phone delivery.</span>
          </span>
          <ChevronRight size={18} className="text-cyan-100" />
        </button>

        <p className="text-center text-slate-400">
          New to Elite Clinic?{' '}
          <button type="button" onClick={() => navigate('/signup')} className="font-semibold text-cyan-100 transition hover:text-white">
            Create an account
          </button>
        </p>
      </div>

      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          onVerified={() => {
            setShowVerificationModal(false);
            navigate('/dashboard');
          }}
        />
      )}
    </AuthShell>
  );
}
