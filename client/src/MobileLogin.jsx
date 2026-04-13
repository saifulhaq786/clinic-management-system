import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Check, Smartphone, Phone } from 'lucide-react';
import api from './api';
import AuthShell from './components/AuthShell';
import { persistSession } from './authSession';

export default function MobileLogin() {
  const [stage, setStage] = useState('phone'); // 'phone' | 'otp' | 'newuser'
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  
  const navigate = useNavigate();

  const countryCodes = [
    { code: '+1', country: '🇺🇸 USA / Canada' },
    { code: '+44', country: '🇬🇧 United Kingdom' },
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

  const steps = [
    { key: 'phone', label: 'Phone' },
    { key: 'otp', label: 'Verify' },
    { key: 'newuser', label: 'Profile' },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === stage);

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

      const res = await api.post('/api/mobile/send-otp', { phoneNumber });

      setSuccess(res.data.message || 'OTP sent. Valid for 5 minutes.');
      
      const userRes = await api.get(`/api/mobile/user/${encodeURIComponent(phoneNumber)}`);
      setUserExists(userRes.data.exists);
      
      setStage('otp');
    } catch (err) {
      if (!err.response && err.message?.includes('Network Error')) {
        setError('Server is starting up. Please wait 30 seconds and try again.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to send OTP');
      }
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
      if (!userExists) {
        setStage('newuser');
        setLoading(false);
        return;
      }

      const res = await api.post('/api/mobile/verify-otp', { phoneNumber, otp });
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
      const res = await api.post('/api/mobile/verify-otp', { phoneNumber, otp, name, role });
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
      title="Fast mobile access with clinical-grade security."
      description="Sign in with a one-time code sent to your phone. Add profile details later if needed."
    >
      {/* Back button */}
      {stage !== 'phone' && (
        <button
          onClick={() => {
            if (stage === 'newuser') { setStage('otp'); }
            else { setStage('phone'); setMobileNumber(''); }
          }}
          className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              idx <= currentStepIdx ? 'text-teal-300' : 'text-slate-600'
            }`}>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem] font-semibold transition-colors ${
                idx < currentStepIdx 
                  ? 'border-teal-400/40 bg-teal-400/15 text-teal-300' 
                  : idx === currentStepIdx 
                    ? 'border-teal-400/40 bg-teal-400 text-[#060b18]' 
                    : 'border-slate-700 bg-transparent text-slate-600'
              }`}>
                {idx < currentStepIdx ? <Check size={12} /> : idx + 1}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-1 transition-colors ${idx < currentStepIdx ? 'bg-teal-400/30' : 'bg-slate-700/50'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl border border-teal-400/10 bg-teal-400/[0.06] p-3 text-teal-300">
          <Smartphone size={20} />
        </div>
        <div>
          <p className="text-xs font-medium tracking-widest text-teal-300/70 uppercase">
            {stage === 'phone' ? 'Phone Login' : stage === 'otp' ? 'Verify Code' : 'Complete Account'}
          </p>
          <h2 className="mt-0.5 text-2xl font-semibold text-white">
            {stage === 'phone' ? 'Enter your mobile number' : stage === 'otp' ? 'Enter the OTP' : 'Create your profile'}
          </h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-5 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={
          stage === 'phone' ? handleSendOTP :
          stage === 'otp' ? handleVerifyOTP :
          handleNewUserRegister
        }
        className="space-y-4"
      >
        {stage === 'phone' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Country</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {countryCodes.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.country} ({item.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Mobile Number</label>
              <input
                type="tel"
                placeholder="Enter your number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                required
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
              <Phone size={14} className="text-teal-300/60" />
              Full number: <span className="font-medium text-white">{phoneNumber || '—'}</span>
            </div>

            <button
              type="submit"
              disabled={loading || !mobileNumber || mobileNumber.length < 10}
              className="btn-primary"
            >
              {loading ? 'Sending...' : <><MessageCircle size={17} /> Send OTP</>}
            </button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
              <Phone size={14} className="text-teal-300/60" />
              Code sent to <span className="font-medium text-white">{phoneNumber}</span>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                className="text-center text-2xl tracking-[0.5em] font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary"
            >
              {loading ? 'Verifying...' : <><Check size={17} /> {userExists ? 'Sign In' : 'Continue'}</>}
            </button>
          </>
        )}

        {stage === 'newuser' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Healthcare Professional</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !name}
              className="btn-primary"
            >
              {loading ? 'Creating...' : <><Check size={17} /> Create Account</>}
            </button>
          </>
        )}
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Prefer email login?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-medium text-teal-300 transition hover:text-teal-200">
          Return to email sign in
        </button>
      </div>
    </AuthShell>
  );
}
