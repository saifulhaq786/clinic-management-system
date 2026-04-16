import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Briefcase, Star, MapPin, CheckCircle } from 'lucide-react';
import api from '../api';
import Background3D from './Background3D';

export default function DoctorRegistration() {
  const [form, setForm] = useState({
    specialty: 'General',
    bio: '',
    phone: '',
    age: '',
    gender: 'Not Specified'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // Instead of making a new doctor setup route, we'll patch the user profile
      const payload = {
        role: 'doctor', // Officially upgrade them
        specialty: form.specialty,
        bio: form.bio,
        phone: form.phone,
        age: parseInt(form.age) || undefined,
        gender: form.gender
      };

      await api.put('/api/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.role = 'doctor';
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to complete doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center p-6 relative overflow-hidden">
        <Background3D />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-teal-500/10 border border-teal-500/20 p-12 rounded-3xl text-center max-w-md w-full relative z-10 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle size={80} className="text-teal-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-4">Profile Upgraded!</h2>
          <p className="text-teal-300 mb-6">You are now registered as a Doctor in the system. Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#040810] flex justify-center py-24 px-6 overflow-hidden">
      <Background3D />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 mb-4 flex items-center justify-center gap-4 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <UserPlus className="text-teal-400" size={40} /> Doctor Onboarding
          </h1>
          <p className="text-teal-100/70 text-lg">Complete your professional profile to join clinics and manage patients.</p>
        </div>

        <div className="bg-black/30 backdrop-blur-2xl border border-teal-500/20 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(45,212,191,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-600/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />
          
          <form onSubmit={handleRegister} className="relative z-10 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group md:col-span-2">
                <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block flex items-center gap-2"><Briefcase size={14}/> Primary Specialty</label>
                <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition appearance-none">
                  {['General', 'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Psychiatry'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block">Professional Phone</label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block">Age</label>
                  <input type="number" required value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block">Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition appearance-none">
                    {['Male', 'Female', 'Other', 'Not Specified'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block flex items-center gap-2"><Star size={14}/> Professional Bio</label>
              <textarea required rows={4} placeholder="Describe your experience and approach to care..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition resize-none"></textarea>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit" 
              className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 mt-6"
            >
              <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
              <span className="relative z-10">{loading ? 'Updating Profile...' : 'Complete Doctor Setup'}</span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
