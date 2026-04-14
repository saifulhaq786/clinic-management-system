import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import api from './api';

export default function EmailVerificationModal({ email, onVerified, initialCode }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [fallbackCode, setFallbackCode] = useState('');

  // If server couldn't send email, it provides the code directly
  useEffect(() => {
    if (initialCode) {
      setFallbackCode(initialCode);
      setVerificationCode(initialCode);
    }
  }, [initialCode]);

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

      const res = await api.post('/api/auth/verify-email-code', {
        email,
        code: verificationCode
      });

      setSuccess('Email verified successfully!');
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setTimeout(() => {
        if (onVerified) {
          onVerified(res.data);
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/send-email-verification', { email });
      
      // If email couldn't be sent, server returns the code directly
      if (res.data.verificationCode) {
        setFallbackCode(res.data.verificationCode);
        setVerificationCode(res.data.verificationCode);
        setSuccess('Code generated. See below.');
      } else {
        setSuccess('Verification code sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0c1222] border border-white/[0.06] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Verify Email</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              {success}
            </div>
          )}

          <div>
            <p className="text-slate-400 text-sm mb-2">We've sent a verification code to:</p>
            <p className="text-white font-medium text-center bg-white/[0.03] border border-white/[0.04] p-3 rounded-xl text-sm">
              {email}
            </p>
          </div>

          {/* Fallback: Show code when email can't be delivered */}
          {fallbackCode && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4">
              <p className="text-xs font-medium text-amber-300/80 uppercase tracking-wide mb-2">Email not delivered</p>
              <p className="text-sm text-slate-300 mb-3">The email service couldn't deliver your code. Use this instead:</p>
              <div className="bg-[#060b18] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-semibold text-teal-300 tracking-[0.4em] select-all">{fallbackCode}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">This code has been auto-filled below.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="text-center text-xl tracking-[0.4em] font-semibold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Verifying...' : <><CheckCircle size={17} /> Verify Email</>}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full text-teal-300 hover:text-teal-200 font-medium py-2 text-sm transition"
          >
            {resendLoading ? 'Resending...' : "Didn't receive the code? Resend"}
          </button>

          <p className="text-slate-600 text-xs text-center">
            Code is valid for 15 minutes
          </p>
        </form>
      </div>
    </div>
  );
}
