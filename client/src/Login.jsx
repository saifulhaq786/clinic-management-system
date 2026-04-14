import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogIn, ShieldCheck } from 'lucide-react';
import api from './api';
import AuthShell from './components/AuthShell';
import GoogleAuthButton from './components/GoogleAuthButton';
import { auth } from './firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { persistSession } from './authSession';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Sign in with Firebase first to check verification status
      const fbUserCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = fbUserCredential.user;

      if (!fbUser.emailVerified) {
        // Not verified yet - provide option to resend
        setError("Please verify your email address to continue. Check your inbox for the link.");
        
        // Optional: Helper to resend link
        setVerificationEmail(email);
        setLoading(false);
        return;
      }

      // 2. Email is verified - Get Firebase Token and sign in to backend
      const idToken = await fbUser.getIdToken();
      const res = await api.post('/api/auth/login', { email, password, firebaseToken: idToken });
      persistSession(res.data);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      let msg = "Login failed. Please check your credentials.";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid credentials. (Tip: If you just migrated, please Sign Up fresh for this new project)";
      
      setError(err.response?.data?.message || msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setError("Verification link resent! Please check your inbox.");
      }
    } catch (err) {
      setError("Failed to resend. Please try again later.");
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
          {error.includes('verify your email') && (
            <button 
              onClick={handleResend}
              className="block mt-2 font-bold text-teal-300 hover:text-teal-200 underline"
            >
              Resend verification link
            </button>
          )}
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
        <GoogleAuthButton setError={setError} />
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
