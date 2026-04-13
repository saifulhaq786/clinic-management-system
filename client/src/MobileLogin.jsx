import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Check } from 'lucide-react';

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
  const [testOtp, setTestOtp] = useState(''); // For development mode testing
  
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
    setTestOtp(''); // Reset test OTP

    try {
      if (!countryCode || !mobileNumber) {
        setError('Country code and mobile number are required');
        setLoading(false);
        return;
      }

      console.log('Sending OTP for phone:', phoneNumber);
      
      const res = await axios.post('http://localhost:5001/api/mobile/send-otp', { phoneNumber });
      console.log('OTP Response:', res.data);
      
      // Capture test OTP for development mode
      if (res.data.testOtp) {
        setTestOtp(res.data.testOtp);
      }
      
      setSuccess('✅ OTP sent! Valid for 5 minutes');
      
      // Check if user exists
      const userRes = await axios.get(`http://localhost:5001/api/mobile/user/${phoneNumber}`);
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
      const res = await axios.post('http://localhost:5001/api/mobile/verify-otp', {
        phoneNumber,
        otp
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
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
      const res = await axios.post('http://localhost:5001/api/mobile/verify-otp', {
        phoneNumber,
        otp,
        name,
        role
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0f172a] to-[#1e3a8a]/20 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-72 h-72 bg-[#2563eb]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1e40af]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
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
            className="mb-6 flex items-center gap-2 text-[#94a3b8] hover:text-[#3b82f6] transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}

        <form
          onSubmit={
            stage === 'phone' ? handleSendOTP :
            stage === 'otp' ? handleVerifyOTP :
            handleNewUserRegister
          }
          className="bg-[#0f172a]/80 backdrop-blur-xl border border-[#1e293b]/50 rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1e40af] flex items-center justify-center">
                <MessageCircle size={36} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] mb-2">
              {stage === 'phone' ? 'Phone Login' : stage === 'otp' ? 'Enter OTP' : 'Complete Profile'}
            </h1>
            <p className="text-[#94a3b8] text-sm font-semibold">
              {stage === 'phone' ? 'Quick registration & login with OTP' :
               stage === 'otp' ? 'Enter the 6-digit code sent to your phone' :
               'Create your account details'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-2xl flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-900/30 rounded-2xl flex items-start gap-3">
              <Check size={18} className="text-green-400 mt-0.5" />
              <p className="text-green-400 text-sm font-semibold">{success}</p>
            </div>
          )}

          {/* STAGE 1: Phone Number */}
          {stage === 'phone' && (
            <div className="space-y-5 mb-8">
              <div className="relative">
                <label className="block text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-2">
                  Country Code
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white outline-none transition-all duration-300 font-medium appearance-none cursor-pointer"
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.country} {item.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="5551234567"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
                  required
                />
                <p className="text-[#64748b] text-xs mt-2">Enter digits only (10-15 digits)</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#1e3a8a]/20 border border-[#3b82f6]/30 rounded-2xl">
                <span className="text-[#60a5fa] font-bold">Full Number:</span>
                <span className="text-[#e2e8f0] font-mono">{phoneNumber || '(will appear here)'}</span>
              </div>

              <button
                type="submit"
                disabled={loading || !mobileNumber || mobileNumber.length < 10}
                className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-black py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin">⏳</span> : <MessageCircle size={18} />}
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* STAGE 2: OTP Verification */}
          {stage === 'otp' && (
            <div className="space-y-5 mb-8">
              <div className="p-4 bg-[#1e3a8a]/20 border border-[#3b82f6]/30 rounded-2xl">
                <p className="text-[#60a5fa] text-xs font-bold mb-1">Verification Code Sent To:</p>
                <p className="text-[#e2e8f0] text-lg font-mono font-bold">{phoneNumber}</p>
              </div>

              <div className="relative">
                <label className="block text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-2">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  className="w-full text-center text-3xl tracking-widest bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-black"
                  required
                />
              </div>

              {/* Test OTP display (development only) */}
              {testOtp && (
                <div className="p-4 bg-[#1e3a8a]/30 border border-[#3b82f6]/30 rounded-2xl">
                  <p className="text-[#60a5fa] text-xs font-bold">🧪 TEST OTP: {testOtp}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-black py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin">⏳</span> : <Check size={18} />}
                {loading ? 'Verifying...' : userExists ? 'Login' : 'Continue'}
              </button>

              <p className="text-[#64748b] text-xs text-center">
                Didn't receive the code? <button type="button" onClick={() => { setStage('phone'); setMobileNumber(''); }} className="text-[#3b82f6] hover:text-[#60a5fa] font-bold">Request again</button>
              </p>
            </div>
          )}

          {/* STAGE 3: New User Registration */}
          {stage === 'newuser' && (
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1e293b]/30 border border-[#334155]/50 focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] text-xs font-bold uppercase tracking-widest mb-2">
                  I am a
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#1e293b]/30 border border-[#334155]/50 focus:border-[#3b82f6] p-4 rounded-2xl text-white outline-none transition-all duration-300 font-bold appearance-none cursor-pointer"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Healthcare Professional</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !name}
                className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-black py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin">⏳</span> : <Check size={18} />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-[#64748b] text-xs text-center font-semibold uppercase tracking-widest">
            {stage === 'phone' ? 'Secure • Privacy Protected' : 'OTP expires in 5 minutes'}
          </p>
        </form>

        {/* Back to email login */}
        <p className="text-center mt-6 text-[#64748b] text-sm">
          Prefer email login?{' '}
          <a href="/login" className="text-[#3b82f6] hover:text-[#60a5fa] font-bold transition">
            Email Login
          </a>
        </p>
      </div>
    </div>
  );
}
