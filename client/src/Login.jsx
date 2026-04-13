import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0f172a] to-[#1e3a8a]/20 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-72 h-72 bg-[#2563eb]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1e40af]/10 rounded-full blur-3xl"></div>
      </div>

      <form onSubmit={handleLogin} className="relative w-full max-w-md">
        {/* Premium Glass Card */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-[#1e293b]/50 rounded-3xl p-8 md:p-10 shadow-2xl">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1e40af] flex items-center justify-center shadow-xl shadow-blue-600/30">
              <Shield size={40} className="text-white" />
              <div className="absolute inset-0 rounded-2xl bg-white/5"></div>
            </div>
          </div>

          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] mb-2 tracking-tight">Elite Clinic</h1>
            <p className="text-[#94a3b8] text-sm font-semibold">Professional Healthcare Management</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-2xl flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5 mb-8">
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
                required 
              />
            </div>

            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium pr-12"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#3b82f6] transition"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Regular Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-black py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-[#64748b] text-sm">Don't have an account? 
              <a href="/signup" className="text-[#3b82f6] hover:text-[#60a5fa] font-bold ml-1 transition">Create one</a>
            </p>
          </div>

          {/* Mobile Login Option */}
          <div className="mt-4 pt-4 border-t border-[#334155]/30 text-center">
            <p className="text-[#64748b] text-xs mb-2 font-semibold">Or login with phone number</p>
            <a href="/mobile-login" className="inline-block text-[#3b82f6] hover:text-[#60a5fa] font-bold text-sm transition">
              📱 Phone Login with OTP →
            </a>
          </div>


        </div>
      </form>
    </div>
  );
}