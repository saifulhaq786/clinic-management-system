import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../api';
import Background3D from './Background3D';

export default function ClinicRegistration() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    registrationNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    lng: '',
    lat: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clinicId, setClinicId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingClinic = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (user.role === 'clinic_admin') {
          const res = await api.get('/api/clinics/my-clinic', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data) {
            setEditMode(true);
            setClinicId(res.data._id);
            setForm({
              name: res.data.name || '',
              email: res.data.email || '',
              phone: res.data.phone || '',
              description: res.data.description || '',
              registrationNumber: res.data.registrationNumber || '',
              addressLine1: res.data.address?.line1 || '',
              addressLine2: res.data.address?.line2 || '',
              city: res.data.address?.city || '',
              state: res.data.address?.state || '',
              pincode: res.data.address?.pincode || '',
              lng: res.data.location?.coordinates[0] || '',
              lat: res.data.location?.coordinates[1] || ''
            });
          }
        }
      } catch (err) {
        console.error("No existing clinic found or failed to load");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingClinic();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        coordinates: [parseFloat(form.lng) || 0, parseFloat(form.lat) || 0]
      };
      
      const token = localStorage.getItem('token');
      
      if (editMode && clinicId) {
        await api.put(`/api/clinics/${clinicId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/api/clinics/register', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local storage user role to clinic_admin to reflect the backend change
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.role = 'clinic_admin';
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      alert(error.response?.data?.error || `Failed to ${editMode ? 'update' : 'register'} clinic`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null; // Or a spinner

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
          <h2 className="text-3xl font-black text-white mb-4">Clinic {editMode ? 'Updated' : 'Registered'}!</h2>
          <p className="text-teal-300 mb-6">Your clinic data has been saved to the network. Redirecting to dashboard...</p>
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
        className="max-w-3xl w-full relative z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 mb-4 flex items-center justify-center gap-4 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <Building2 className="text-teal-400" size={40} /> Partner Clinic {editMode ? 'Settings' : 'Setup'}
          </h1>
          <p className="text-teal-100/70 text-lg">{editMode ? 'Keep your clinic configuration and location data up to date.' : 'Onboard your facility to connect with doctors and patients seamlessly.'}</p>
        </div>

        <div className="bg-black/30 backdrop-blur-2xl border border-teal-500/20 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(45,212,191,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />
          
          <form onSubmit={handleRegister} className="relative z-10 space-y-6">
            
            {/* Trust Verification */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-4">
              <ShieldCheck size={32} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest block mb-1">Official Medical Board Registration Number *</label>
                <input required value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})} placeholder="E.g., MED-12345-REG" className="w-full bg-black/40 border border-emerald-500/20 focus:border-emerald-500/50 p-3 rounded-lg text-white outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block flex items-center gap-2"><Building2 size={14}/> Clinic Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition" />
              </div>

              <div className="group">
                <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block flex items-center gap-2"><Mail size={14}/> Public Contact Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition" />
              </div>

              <div className="group">
                <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block flex items-center gap-2"><Phone size={14}/> Front Desk Phone</label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition" />
              </div>
            </div>

            {/* Address Details Block */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MapPin size={18} className="text-teal-400"/> Structured Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group md:col-span-2">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-2 block">Address Line 1</label>
                  <input required placeholder="Street Address, Building Name" value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-3 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group md:col-span-2">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-2 block">Address Line 2 (Optional)</label>
                  <input placeholder="Suite, Floor, etc." value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-3 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-2 block">City / District</label>
                  <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-3 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-2 block">State / Province</label>
                  <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-3 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-2 block">ZIP / Pincode</label>
                  <input required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-3 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-2 block">Map Coordinates {editMode && '(Populated)'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Lng" type="number" step="any" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} className="w-full bg-black/60 border border-teal-500/20 p-3 rounded-xl text-white text-sm outline-none focus:border-teal-500/50 transition" />
                    <input placeholder="Lat" type="number" step="any" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} className="w-full bg-black/60 border border-teal-500/20 p-3 rounded-xl text-white text-sm outline-none focus:border-teal-500/50 transition" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mb-3 block flex items-center gap-2"><FileText size={14}/> Description / Services Provided</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 p-4 rounded-xl text-white outline-none transition resize-none"></textarea>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              type="submit" 
              className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 mt-6"
            >
              <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
              <span className="relative z-10">{saving ? 'Saving...' : (editMode ? 'Update Clinic Profile' : 'Complete Registration')}</span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
