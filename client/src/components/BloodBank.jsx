import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, MapPin, Phone, AlertTriangle, Plus, CheckCircle, Activity, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function BloodBank() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    bloodType: 'A+',
    hospitalName: '',
    location: '',
    unitsRequired: 1,
    urgency: 'Normal'
  });
  const [redTheme, setRedTheme] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !user?.id) {
      navigate('/login');
      return;
    }
    let isCancelled = false;

    const loadRequests = async () => {
      try {
        const res = await api.get('/api/blood/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!isCancelled) {
          setRequests(res.data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to fetch blood requests", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      isCancelled = true;
    };
  }, [navigate, token, user?.id]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/blood/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch blood requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/blood/request', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Blood request submitted successfully!');
      setShowForm(false);
      setForm({
        ...form,
        patientName: '', hospitalName: '', location: '', contactPhone: ''
      });
      fetchRequests();
    } catch (err) {
      alert('❌ Failed to submit request: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePledge = async (requestId) => {
    if(!window.confirm("Are you sure you want to pledge to donate blood for this request? The requester's contact details will be shared with you.")) return;
    
    try {
      await api.post(`/api/blood/donate/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('💖 Thank you for pledging! Please contact the requester immediately.');
      fetchRequests();
    } catch (err) {
      alert('❌ Pledge failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`relative min-h-[80vh] transition-colors duration-1000 ${redTheme ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950 via-[#050810] to-[#050810]' : ''}`}>
      {/* Floating Blood Drop in Background */}
      <motion.div 
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        onClick={() => setRedTheme(!redTheme)}
        className="absolute top-20 right-10 md:right-32 z-0 cursor-pointer pointer-events-auto"
        title="Toggle Emergency Mode"
      >
        <Droplet 
          size={250} 
          className={`transition-all duration-1000 blur-sm ${redTheme ? 'text-red-600/30' : 'text-red-500/10'}`} 
          strokeWidth={1}
          fill="currentColor"
        />
        {/* Glow behind drop */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[60px] transition-all duration-1000 ${redTheme ? 'bg-red-600/40' : 'bg-red-500/20'}`} />
      </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-8 relative z-10 transition-all duration-1000 ${redTheme ? 'drop-shadow-[0_0_50px_rgba(220,38,38,0.15)]' : ''}`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          >
            <Activity size={14} className="animate-pulse" /> Live Feed
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-4">
            <Heart className="text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" size={40} />
            Blood Network
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Connect. Donate. Save Lives locally.</p>
        </div>
        
        {!showForm && (
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(220, 38, 38, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="group relative z-10 overflow-hidden bg-gradient-to-br from-red-600 to-red-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out skew-x-12 -translate-x-full"></div>
            <Plus size={22} className="relative z-10" /> 
            <span className="relative z-10 text-lg">Urgent Request</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="relative z-20"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-[2rem] blur opacity-20 pointer-events-none"></div>
            <div className="relative bg-[#0f172a]/80 border border-gray-700/50 p-8 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-gray-700/50 pb-4">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Droplet className="text-red-500" /> Need Blood Urgently
                </h3>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Patient Name</label>
                  <input required value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} className="w-full bg-[#050810]/50 border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 p-4 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Blood Type</label>
                  <select value={form.bloodType} onChange={e => setForm({...form, bloodType: e.target.value})} className="w-full bg-[#050810]/50 border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 p-4 rounded-xl text-white outline-none transition appearance-none">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Hospital Name</label>
                  <input required value={form.hospitalName} onChange={e => setForm({...form, hospitalName: e.target.value})} className="w-full bg-[#050810]/50 border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 p-4 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Location</label>
                  <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full bg-[#050810]/50 border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 p-4 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Units Required</label>
                  <input type="number" min="1" required value={form.unitsRequired} onChange={e => setForm({...form, unitsRequired: e.target.value})} className="w-full bg-[#050810]/50 border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 p-4 rounded-xl text-white outline-none transition" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Contact Phone</label>
                  <input required value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full bg-[#050810]/50 border border-gray-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 p-4 rounded-xl text-white outline-none transition" />
                </div>
                <div className="md:col-span-2 mt-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { level: 'Normal', color: 'bg-blue-500' },
                      { level: 'Urgent', color: 'bg-orange-500' },
                      { level: 'Critical', color: 'bg-red-600' }
                    ].map(({level, color}) => (
                      <label key={level} className={`relative overflow-hidden p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 ${form.urgency === level ? `border-${color.split('-')[1]}-500 bg-${color.split('-')[1]}-500/10 shadow-[0_0_15px_rgba(var(--tw-color-${color.split('-')[1]}-500),0.2)]` : 'bg-[#050810]/50 border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                        <input type="radio" className="hidden" name="urgency" value={level} checked={form.urgency === level} onChange={() => setForm({...form, urgency: level})} />
                        {form.urgency === level && <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>}
                        <span className={`font-bold ${form.urgency === level ? 'text-white' : ''}`}>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="w-full relative group overflow-hidden bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">Broadcast Request to Network</span>
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 2 }}>
            <Droplet size={32} className="text-red-500/50" />
          </motion.div>
          <p className="font-bold tracking-widest uppercase text-sm">Syncing with network...</p>
        </div>
      ) : requests.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-gradient-to-b from-[#0f172a] to-black rounded-[2rem] border border-gray-800/50 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <Heart size={64} className="mx-auto text-gray-700 mb-6 drop-shadow-2xl" />
          <h3 className="text-2xl text-white font-black mb-3">No Active Emergency</h3>
          <p className="text-gray-400 max-w-md mx-auto">The blood network is quiet right now. Check back later or request blood if you have an emergency.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {requests.map(req => {
            const requesterId = req.requesterId?._id || req.requesterId;
            const isMyRequest = requesterId?.toString?.() === user?.id?.toString?.();
            const alreadyPledged = req.donors.some(d => (d.donorId?._id || d.donorId)?.toString?.() === user?.id?.toString?.());
            const progress = (req.donors.length / req.unitsRequired) * 100;

            const getUrgencyColor = (urgencyLevel) => {
              if (urgencyLevel === 'Critical') return 'red';
              if (urgencyLevel === 'Urgent') return 'orange';
              return 'blue';
            };
            const uColor = getUrgencyColor(req.urgency);
            
            return (
              <motion.div 
                variants={itemVariants}
                key={req._id} 
                className="group relative bg-[#0a0f1c]/80 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Glow behind card */}
                <div className={`absolute -inset-0.5 bg-gradient-to-b from-${uColor}-500 to-transparent opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 -z-10`}></div>
                
                <div className={`h-2 w-full bg-gradient-to-r from-${uColor}-600 to-${uColor}-400`}></div>
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-${uColor}-500/10 border border-${uColor}-500/30 flex items-center justify-center text-xl font-black text-${uColor}-500 shadow-[inset_0_0_15px_rgba(var(--tw-color-${uColor}-500),0.1)]`}>
                        {req.bloodType}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{req.patientName}</h3>
                        <p className="text-gray-400 text-xs mt-1 font-medium">{req.hospitalName}</p>
                      </div>
                    </div>
                    {req.urgency !== 'Normal' && (
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 ${req.urgency === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-orange-500/20 text-orange-500 border border-orange-500/20'}`}>
                        {req.urgency === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                        {req.urgency}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <MapPin size={14} className="text-gray-500" /> 
                      <span className="truncate">{req.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Phone size={14} className="text-gray-500" /> 
                      <span className="font-mono">{alreadyPledged || isMyRequest ? req.contactPhone : "Locked (Pledge to view)"}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fulfilment</span>
                      <span className="text-white font-black text-sm">{req.donors.length} <span className="text-gray-500 font-normal">/ {req.unitsRequired}</span></span>
                    </div>
                    <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r from-${uColor}-600 to-${uColor}-400 relative`}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </div>

                  {!isMyRequest ? (
                    alreadyPledged ? (
                      <div className="w-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold py-3.5 rounded-xl text-center flex justify-center items-center gap-2 text-sm">
                        <CheckCircle size={16} /> Pledged Successfully
                      </div>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePledge(req._id)}
                        className={`w-full group overflow-hidden relative bg-transparent text-${uColor}-500 border border-${uColor}-500/30 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm hover:border-${uColor}-500`}
                      >
                        <Droplet size={16} className={`group-hover:fill-${uColor}-500/20 transition-all`} /> Pledge to Help
                      </motion.button>
                    )
                  ) : (
                    <div className="w-full bg-white/5 text-white/50 py-3.5 rounded-xl text-center text-sm font-bold border border-white/5">
                      Your Request
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
    </div>
  );
}

