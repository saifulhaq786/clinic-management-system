import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, MailPlus, ShieldCheck } from 'lucide-react';
import EmailVerificationModal from './EmailVerificationModal';
import api from './api';
import AuthShell from './components/AuthShell';
import GoogleAuthButton from './components/GoogleAuthButton';
import { getStoredUser, isPhoneOnlyAccount, persistSession } from './authSession';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialty: 'General' });
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [phoneUpgradeMode, setPhoneUpgradeMode] = useState(false);
  const navigate = useNavigate();
  const existingUser = getStoredUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    setPhoneUpgradeMode(isPhoneOnlyAccount(existingUser));
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords([p.coords.longitude, p.coords.latitude]),
      () => {
        setError("GPS access required. Please enable location services.");
      }
    );
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!coords) {
      setError("Waiting for GPS lock. Please enable location services...");
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        location: { type: 'Point', coordinates: coords }
      };
      const res = phoneUpgradeMode && token
        ? await api.post('/api/auth/link-email', payload, {
            headers: { Authorization: `Bearer ${token}` }
          })
        : await api.post('/api/auth/register', payload);
      
      console.log('Registration response:', res.data);

      if (phoneUpgradeMode) {
        persistSession(res.data);
        navigate('/dashboard');
        return;
      }

      setVerificationEmail(form.email);
      setShowVerificationModal(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (userData) => {
    console.log('Email verified, user data:', userData);
    setShowVerificationModal(false);
    navigate('/dashboard');
  };

  return (
    <AuthShell
      eyebrow={phoneUpgradeMode ? "Complete Your Account" : "Create Account"}
      title={phoneUpgradeMode ? "Add a secure email login to your phone account." : "Create an account that feels premium from the first click."}
      description={phoneUpgradeMode ? "You already have a verified phone-based profile. Finish setup with a professional email and password so you can sign in any way you prefer." : "Join a polished healthcare platform built for dependable coordination, privacy, and premium patient experience."}
    >
      <button
        onClick={() => navigate('/login')}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
      >
        <ChevronLeft size={18} /> Back to Login
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
          {phoneUpgradeMode ? <MailPlus size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
            {phoneUpgradeMode ? 'Upgrade Access' : 'Join Elite Clinic'}
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-white">
            {phoneUpgradeMode ? 'Add Email & Password' : 'Create your profile'}
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
          required
        />

        <input
          type="email"
          placeholder="Professional email address"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
          required
        />

        <input
          type="password"
          placeholder={phoneUpgradeMode ? 'Create a password for email login' : 'Create a password'}
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
          required
        />

        <select
          value={form.role}
          onChange={e => setForm({...form, role: e.target.value})}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white focus:border-cyan-300"
        >
          <option value="patient">I am a Patient</option>
          <option value="doctor">I am a Healthcare Professional</option>
        </select>

        {form.role === 'doctor' && (
          <input
            placeholder="Medical specialty"
            value={form.specialty}
            onChange={e => setForm({...form, specialty: e.target.value})}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
          />
        )}

        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          coords ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' : 'border-amber-400/20 bg-amber-500/10 text-amber-100'
        }`}>
          {coords ? 'Location secured for nearby care and scheduling.' : 'Waiting for location permission so we can complete setup.'}
        </div>

        <button
          type="submit"
          disabled={loading || !coords}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : (
            <>
              <CheckCircle2 size={18} />
              {phoneUpgradeMode ? 'Add Email Login' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      {!phoneUpgradeMode && (
        <div className="mt-6">
          <GoogleAuthButton
            role={form.role}
            location={coords ? { type: 'Point', coordinates: coords } : undefined}
            setError={setError}
          />
        </div>
      )}

      <div className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-semibold text-cyan-100 transition hover:text-white">
          Sign in
        </button>
      </div>

      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          onVerified={handleVerificationComplete}
        />
      )}
    </AuthShell>
  );
}
