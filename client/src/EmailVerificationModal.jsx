import React, { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerificationModal({ email, onVerified }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!verificationCode) {
        setError('Please enter the verification code');
        setLoading(false);
        return;
      }

      const res = await axios.post('http://localhost:5001/api/auth/verify-email-code', {
        email,
        code: verificationCode
      });

      console.log('✅ Email verified:', res.data);
      setSuccess('✅ Email verified successfully!');
      
      // Save token and user
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        if (onVerified) {
          onVerified(res.data);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5001/api/auth/resend-email-verification', {
        email
      });

      setSuccess('✅ Verification code resent to your email!');
      console.log('Test code:', res.data.testCode);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a]/95 border border-[#1e293b]/50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Mail size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Verify Email</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start gap-3">
              <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-green-400 text-sm font-semibold">{success}</p>
            </div>
          )}

          <div>
            <p className="text-[#94a3b8] text-sm mb-3">
              We've sent a verification code to:
            </p>
            <p className="text-white font-bold text-center bg-[#1e293b]/50 p-3 rounded-lg mb-4">
              {email}
            </p>
          </div>

          {/* Verification Code Input */}
          <div>
            <label className="block text-[#94a3b8] text-xs font-bold uppercase mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full text-center text-2xl tracking-widest bg-[#1e293b]/50 border border-[#334155] focus:border-[#3b82f6] p-3 rounded-lg text-white placeholder-[#64748b] outline-none transition font-bold"
              required
            />
          </div>



          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Verify Email
              </>
            )}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full text-[#3b82f6] hover:text-[#60a5fa] font-bold py-2 rounded-lg transition disable:opacity-50 text-sm"
          >
            {resendLoading ? 'Resending...' : "Didn't receive the code? Resend"}
          </button>

          <p className="text-[#64748b] text-xs text-center">
            Code is valid for 15 minutes
          </p>
        </form>
      </div>
    </div>
  );
}
