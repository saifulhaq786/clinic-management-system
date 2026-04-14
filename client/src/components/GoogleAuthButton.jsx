import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api';
import { persistSession } from '../authSession';

export default function GoogleAuthButton({ role = 'patient', location, setError }) {
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // We'll send the access token to our backend
        const res = await api.post('/api/auth/google', {
          accessToken: tokenResponse.access_token,
          role,
          location
        });
        persistSession(res.data);
        navigate('/dashboard');
      } catch (err) {
        setError?.(err.response?.data?.error || err.message || 'Google sign-in failed.');
      }
    },
    onError: () => setError?.('Google sign-in was cancelled or failed.'),
  });

  if (!googleClientId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs font-medium tracking-wide text-slate-500 uppercase">
        <div className="h-px flex-1 bg-white/[0.06]" />
        Or continue with
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <button
        type="button"
        onClick={() => login()}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.06] bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50 hover:shadow-lg active:scale-[0.98]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}
