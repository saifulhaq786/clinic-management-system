import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, ChevronLeft } from 'lucide-react';
import EmailVerificationModal from './EmailVerificationModal';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialty: 'General' });
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
      const res = await axios.post('http://localhost:5001/api/auth/register', payload);
      
      console.log('Registration response:', res.data);
      
      // Show email verification modal
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
    // Redirect to dashboard after verification
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0f172a] to-[#1e3a8a]/20 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-72 h-72 bg-[#2563eb]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1e40af]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-2 text-[#94a3b8] hover:text-[#3b82f6] transition-colors font-bold text-sm"
        >
          <ChevronLeft size={18} /> Back to Login
        </button>

        {/* Premium Glass Card */}
        <form onSubmit={handleSignup} className="bg-[#0f172a]/80 backdrop-blur-xl border border-[#1e293b]/50 rounded-3xl p-8 md:p-10 shadow-2xl">
          
          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] mb-2 tracking-tight">Join Elite</h1>
            <p className="text-[#94a3b8] text-sm font-semibold">Professional Healthcare Network</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-2xl flex items-start gap-3">
              <div className="w-1 h-1 bg-red-500 rounded-full mt-2"></div>
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 mb-8">
            {/* Name Field */}
            <div className="relative group">
              <input 
                placeholder="Full Name" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
                required 
              />
            </div>

            {/* Email Field */}
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
                required 
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <input 
                type="password" 
                placeholder="Create Password" 
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} 
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
                required 
              />
            </div>

            {/* Role Selection */}
            <div className="relative group">
              <select 
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white outline-none transition-all duration-300 font-bold appearance-none cursor-pointer"
              >
                <option value="patient">I am a Patient</option>
                <option value="doctor">I am a Healthcare Professional</option>
              </select>
            </div>

            {/* Specialty Field (Doctors Only) */}
            {form.role === 'doctor' && (
              <div className="relative group">
                <input 
                  placeholder="Medical Specialty (e.g. Cardiology)" 
                  value={form.specialty}
                  onChange={e => setForm({...form, specialty: e.target.value})} 
                  className="w-full bg-[#1e3a8a]/20 border border-[#3b82f6]/30 p-4 rounded-2xl text-[#60a5fa] placeholder-[#3b82f6]/50 outline-none transition-all duration-300 font-bold"
                />
              </div>
            )}

            {/* GPS Status */}
            <div className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
              coords 
                ? 'bg-green-900/20 border-green-900/30' 
                : 'bg-amber-900/20 border-amber-900/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${coords ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <MapPin size={16} className={coords ? 'text-green-400' : 'text-amber-400'} />
              <span className={`text-[11px] font-bold uppercase tracking-widest ${coords ? 'text-green-400' : 'text-amber-400'}`}>
                {coords ? '✓ Location Secured' : '⏳ Acquiring Coordinates...'}
              </span>
            </div>
          </div>

          {/* Sign Up Button */}
          <button 
            type="submit" 
            disabled={loading || !coords}
            className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-black py-3 md:py-4 rounded-2xl uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? 'Creating Account...' : (
              <>
                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                <span>Create Account</span>
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <p className="text-[#64748b] text-sm">Already have an account?  
              <a href="/login" className="text-[#3b82f6] hover:text-[#60a5fa] font-bold ml-1 transition">Sign in</a>
            </p>
          </div>

          {/* Footer */}
          <p className="text-[#64748b] text-[11px] font-bold mt-6 text-center uppercase tracking-widest leading-relaxed">
            By signing up, you agree to our Terms of Service & Privacy Policy
          </p>
        </form>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={verificationEmail}
          onVerified={handleVerificationComplete}
        />
      )}
    </div>
  );
}