import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { persistSession } from '../authSession';

export default function GoogleAuthButton({ role = 'patient', location, setError }) {
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return null;
  }

  const handleSuccess = async (response) => {
    try {
      if (!response.credential) {
        throw new Error('Google sign-in did not return a credential.');
      }

      const res = await api.post('/api/auth/google', {
        credential: response.credential,
        role,
        location
      });

      persistSession(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError?.(err.response?.data?.error || err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs font-medium tracking-wide text-slate-500 uppercase">
        <div className="h-px flex-1 bg-white/[0.06]" />
        Or continue with
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white">
        <div className="[&>div]:!w-full [&_iframe]:!w-full">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError?.('Google sign-in was cancelled or failed.')}
            text="continue_with"
            theme="outline"
            shape="pill"
            size="large"
            width="380"
          />
        </div>
      </div>
    </div>
  );
}
