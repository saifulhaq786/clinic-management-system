import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Briefcase, Mail, Phone, FileText, CheckCircle, Copy } from 'lucide-react';
import api from '../api';

export default function AddDoctorModal({ isOpen, onClose, clinicId, onDoctorAdded }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'General',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [onboardedDoctor, setOnboardedDoctor] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(`/api/clinics/${clinicId}/register-doctor`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOnboardedDoctor(res.data.doctor);
      if (onDoctorAdded) onDoctorAdded();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to onboard doctor');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#040810]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <UserPlus className="text-teal-400" size={28} />
                    Onboard Professional
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Register a new doctor for your clinic roster.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {!onboardedDoctor ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest mb-1.5 block px-1">Full Name</label>
                      <div className="relative">
                        <input
                          required
                          value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                          placeholder="Dr. John Doe"
                          className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-2xl text-white outline-none transition px-12"
                        />
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest mb-1.5 block px-1">Email (Login)</label>
                        <div className="relative">
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            placeholder="doctor@clinic.com"
                            className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-2xl text-white outline-none transition px-12"
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest mb-1.5 block px-1">Phone</label>
                        <div className="relative">
                          <input
                            required
                            value={form.phone}
                            onChange={e => setForm({...form, phone: e.target.value})}
                            placeholder="+1 234 567 890"
                            className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-2xl text-white outline-none transition px-12"
                          />
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest mb-1.5 block px-1">Specialty</label>
                      <select
                        value={form.specialty}
                        onChange={e => setForm({...form, specialty: e.target.value})}
                        className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-2xl text-white outline-none transition appearance-none"
                      >
                        {['General', 'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Psychiatry'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-teal-400/80 uppercase tracking-widest mb-1.5 block px-1">Professional Bio</label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={form.bio}
                          onChange={e => setForm({...form, bio: e.target.value})}
                          placeholder="Experienced general practitioner..."
                          className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-2xl text-white outline-none transition px-12 resize-none"
                        />
                        <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Register Professional'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
                  >
                    <CheckCircle size={40} className="text-emerald-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Registration Complete!</h3>
                  <p className="text-slate-400 text-sm mb-8">Account created for <span className="text-white font-bold">{onboardedDoctor.name}</span></p>
                  
                  {onboardedDoctor.tempPassword && (
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 mb-8 text-left">
                      <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 block">Temporary Login Password</label>
                      <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                        <code className="text-teal-300 font-mono text-lg">{onboardedDoctor.tempPassword}</code>
                        <button 
                          onClick={() => copyToClipboard(onboardedDoctor.tempPassword)}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 italic">Please provide this password to the doctor. They should change it upon first login.</p>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition"
                  >
                    Close Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
