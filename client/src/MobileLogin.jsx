import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Check, Smartphone, Phone, User, Activity } from 'lucide-react';
import api from './api';
import AuthShell from './components/AuthShell';
import { persistSession } from './authSession';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [firebaseToken, setFirebaseToken] = useState('');
  
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

      // 1. Initialize Recaptcha (Visible for stability)
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            console.log("✅ reCAPTCHA solved");
          },
          'expired-callback': () => {
            setError("reCAPTCHA expired. Please try again.");
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });
        await window.recaptchaVerifier.render(); // Explicit render for visible mode
      }

      // 2. Send OTP via Firebase
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      
      // 3. Mark if user exists for later (Resilient check)
      try {
        const userRes = await api.get(`/api/mobile/user/${encodeURIComponent(phoneNumber)}`);
        setUserExists(userRes.data.exists);
      } catch (checkErr) {
        console.warn("Mobile user check failed, continuing anyway:", checkErr.message);
        // Fallback: assume user might exist or let the backend handle it
        setUserExists(true); 
      }

      setSuccess("Verification code sent to your phone!");
      setStage('otp');
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      setError(err.message || "Failed to send verification code. Please try again.");
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
      // 1. Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      if (userExists) {
        // Log in existing user
        const loginRes = await api.post('/api/mobile/verify-otp', { 
          phoneNumber, 
          firebaseToken: idToken 
        });
        // FIX: Wrap in object to match persistSession({ token, user })
        persistSession({ 
          token: loginRes.data.token, 
          user: loginRes.data.user 
        });
        navigate('/dashboard');
      } else {
        // Move to profile step for new user
        setStage('newuser');
        setFirebaseToken(idToken);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Invalid or expired verification code.");
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
        firebaseToken, 
        name, 
        role 
      });
      // FIX: Use object format to match persistSession({ token, user })
      persistSession({ 
        token: res.data.token, 
        user: res.data.user 
      });
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
      <div id="recaptcha-container"></div>
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

            {fallbackOtp && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4">
                <p className="text-xs font-medium text-amber-300/80 uppercase tracking-wide mb-2">Twilio Trial — SMS not delivered</p>
                <p className="text-sm text-slate-300 mb-3">Your number isn't verified on our Twilio trial account. Use this code instead:</p>
                <div className="bg-[#060b18] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
                  <span className="text-2xl font-semibold text-teal-300 tracking-[0.4em] select-all">{fallbackOtp}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">This code has been auto-filled below.</p>
              </div>
            )}
            
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

            <div className="space-y-3">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                    role === 'patient' 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${role === 'patient' ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                    <User size={18} />
                  </div>
                  <span className={`text-sm font-bold ${role === 'patient' ? 'text-white' : 'text-slate-400'}`}>Patient</span>
                  <span className="text-[0.7rem] text-slate-500 mt-0.5">Seeking Care</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                    role === 'doctor' 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${role === 'doctor' ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                    <Activity size={18} />
                  </div>
                  <span className={`text-sm font-bold ${role === 'doctor' ? 'text-white' : 'text-slate-400'}`}>Doctor</span>
                  <span className="text-[0.7rem] text-slate-500 mt-0.5">Providing Care</span>
                </button>
              </div>
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
