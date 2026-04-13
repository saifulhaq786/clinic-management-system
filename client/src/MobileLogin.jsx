import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Check, Smartphone } from 'lucide-react';
import api from './api';
import AuthShell from './components/AuthShell';
import { persistSession } from './authSession';

export default function MobileLogin() {
  const [stage, setStage] = useState('phone'); // 'phone' | 'otp' | 'newuser'
  const [countryCode, setCountryCode] = useState('+1'); // USA default
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  
  const navigate = useNavigate();

  // Country codes list
  const countryCodes = [
    { code: '+1', country: '🇺🇸 USA/Canada' },
    { code: '+44', country: '🇬🇧 UK' },
    { code: '+91', country: '🇮🇳 India' },
    { code: '+61', country: '🇦🇺 Australia' },
    { code: '+33', country: '🇫🇷 France' },
    { code: '+49', country: '🇩🇪 Germany' },
    { code: '+39', country: '🇮🇹 Italy' },
    { code: '+34', country: '🇪🇸 Spain' },
    { code: '+31', country: '🇳🇱 Netherlands' },
    { code: '+41', country: '🇨🇭 Switzerland' },
    { code: '+45', country: '🇩🇰 Denmark' },
    { code: '+46', country: '🇸🇪 Sweden' },
    { code: '+47', country: '🇳🇴 Norway' },
    { code: '+81', country: '🇯🇵 Japan' },
    { code: '+86', country: '🇨🇳 China' },
    { code: '+52', country: '🇲🇽 Mexico' },
    { code: '+55', country: '🇧🇷 Brazil' },
    { code: '+27', country: '🇿🇦 South Africa' },
  ];

  const phoneNumber = countryCode + mobileNumber;

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!countryCode || !mobileNumber) {
        setError('Country code and mobile number are required');
        setLoading(false);
        return;
      }

      console.log('Sending OTP for phone:', phoneNumber);
      
      const res = await api.post('/api/mobile/send-otp', { phoneNumber });
      console.log('OTP Response:', res.data);

      setSuccess(res.data.message || 'OTP sent. Valid for 5 minutes.');
      
      // Check if user exists
      const userRes = await api.get(`/api/mobile/user/${encodeURIComponent(phoneNumber)}`);
      console.log('User exists:', userRes.data);
      setUserExists(userRes.data.exists);
      
      setStage('otp');
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // If new user, go to registration
      if (!userExists) {
        setStage('newuser');
        setLoading(false);
        return;
      }

      // Existing user - verify and login
      const res = await api.post('/api/mobile/verify-otp', {
        phoneNumber,
        otp
      });

      persistSession(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register new user
  const handleNewUserRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/mobile/verify-otp', {
        phoneNumber,
        otp,
        name,
        role
      });

      persistSession(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Phone Authentication"
      title="Fast mobile access, still handled with clinical-grade polish."
      description="Use OTP delivery to sign in quickly, then add richer profile details when needed."
    >
      {stage !== 'phone' && (
        <button
          onClick={() => {
            if (stage === 'newuser') {
              setStage('otp');
            } else {
              setStage('phone');
              setMobileNumber('');
            }
          }}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          <ArrowLeft size={18} /> Back
        </button>
      )}

      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
          <Smartphone size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
            {stage === 'phone' ? 'Phone Login' : stage === 'otp' ? 'Verify Code' : 'Complete Account'}
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-white">
            {stage === 'phone' ? 'Continue with your mobile number' : stage === 'otp' ? 'Enter your OTP' : 'Create your profile'}
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100">
          {success}
        </div>
      )}

      <form
        onSubmit={
          stage === 'phone' ? handleSendOTP :
          stage === 'otp' ? handleVerifyOTP :
          handleNewUserRegister
        }
        className="space-y-5"
      >
        {stage === 'phone' && (
          <>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white focus:border-cyan-300"
            >
              {countryCodes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.country} {item.code}
                </option>
              ))}
            </select>

            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
              required
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Full number: <span className="font-semibold text-white">{phoneNumber || 'Waiting for input'}</span>
            </div>

            <button
              type="submit"
              disabled={loading || !mobileNumber || mobileNumber.length < 10}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : <><MessageCircle size={18} /> Send OTP</>}
            </button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
              Code sent to <span className="font-semibold text-white">{phoneNumber}</span>
            </div>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-3xl tracking-[0.55em] text-white placeholder:text-slate-500 focus:border-cyan-300"
              required
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying...' : <><Check size={18} /> {userExists ? 'Login' : 'Continue'}</>}
            </button>
          </>
        )}

        {stage === 'newuser' && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-slate-500 focus:border-cyan-300"
              required
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white focus:border-cyan-300"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Healthcare Professional</option>
            </select>

            <button
              type="submit"
              disabled={loading || !name}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating...' : <><Check size={18} /> Create Account</>}
            </button>
          </>
        )}
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Prefer email login?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-semibold text-cyan-100 transition hover:text-white">
          Return to email sign in
        </button>
      </div>
    </AuthShell>
  );
}
