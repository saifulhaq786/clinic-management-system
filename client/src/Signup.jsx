import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, MailPlus, ShieldCheck, MapPin } from 'lucide-react';
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
  const [verificationCode, setVerificationCode] = useState('');
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

      // If server auto-verified (email service unavailable), go straight to dashboard
      if (res.data.token && !res.data.requiresVerification) {
        persistSession(res.data);
        navigate('/dashboard');
        return;
      }

      // Email verification required
      setVerificationEmail(form.email);
      setVerificationCode(res.data.verificationCode || '');
      setShowVerificationModal(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (userData) => {
    persistSession(userData);
    setShowVerificationModal(false);
    navigate('/dashboard');
  };

  return (
    <AuthShell
      eyebrow={phoneUpgradeMode ? "Complete Your Account" : "Create Account"}
      title={phoneUpgradeMode ? "Add a secure email login to your phone account." : "Join a platform built for premium patient care."}
      description={phoneUpgradeMode ? "You already have a verified phone-based profile. Finish setup with a professional email and password so you can sign in any way you prefer." : "Set up your credentials and start managing appointments, records, and communication in one place."}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/login')}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
      >
        <ChevronLeft size={16} /> Back to Login
      </button>

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl border border-teal-400/10 bg-teal-400/[0.06] p-3 text-teal-300">
          {phoneUpgradeMode ? <MailPlus size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-teal-300/70 uppercase">
            {phoneUpgradeMode ? 'Upgrade Access' : 'Join Elite Clinic'}
          </p>
          <h2 className="mt-0.5 text-2xl font-semibold text-white">
            {phoneUpgradeMode ? 'Add Email & Password' : 'Create your profile'}
          </h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Full Name</label>
          <input
            placeholder="John Doe"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Password</label>
          <input
            type="password"
            placeholder={phoneUpgradeMode ? 'Create a password for email login' : 'Minimum 6 characters'}
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Account Type</label>
          <select
            value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}
          >
            <option value="patient">I am a Patient</option>
            <option value="doctor">I am a Healthcare Professional</option>
          </select>
        </div>

        {form.role === 'doctor' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Specialty</label>
            <input
              placeholder="e.g. Cardiology, Dermatology"
              value={form.specialty}
              onChange={e => setForm({...form, specialty: e.target.value})}
            />
          </div>
        )}

        {/* Location status */}
        <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${
          coords 
            ? 'border-emerald-400/15 bg-emerald-500/[0.06] text-emerald-300' 
            : 'border-amber-400/15 bg-amber-500/[0.06] text-amber-300'
        }`}>
          <MapPin size={15} />
          {coords ? 'Location secured for nearby care.' : 'Awaiting location permission...'}
        </div>

        <button
          type="submit"
          disabled={loading || !coords}
          className="btn-primary mt-1"
        >
          {loading ? 'Saving...' : (
            <>
              <CheckCircle2 size={17} />
              {phoneUpgradeMode ? 'Add Email Login' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      {/* Google */}
      {!phoneUpgradeMode && (
        <div className="mt-6">
          <GoogleAuthButton
            role={form.role}
            location={coords ? { type: 'Point', coordinates: coords } : undefined}
            setError={setError}
          />
        </div>
      )}

      <div className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-medium text-teal-300 transition hover:text-teal-200">
          Sign in
        </button>
      </div>

      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          initialCode={verificationCode}
          onVerified={handleVerificationComplete}
        />
      )}
    </AuthShell>
  );
}
