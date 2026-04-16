import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Activity, LogOut, Check, X, FileText, Clock, Users, Calendar, Briefcase, ChevronRight, User, Droplet, UserPlus, ShieldCheck } from 'lucide-react';
import DoctorModal from './components/DoctorModal';
import MedicalChatBot from './components/MedicalChatBot';
import ProfileCompletionModal from './ProfileCompletionModal';
import PrescriptionUpload from './components/PrescriptionUpload';
import AddDoctorModal from './components/AddDoctorModal';
import api from './api';
import { getStoredUser } from './authSession';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from './components/Background3D';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [uploadAptId, setUploadAptId] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [showProfileModal, setShowProfileModal] = useState(() => {
    const storedUser = getStoredUser();
    return Boolean(storedUser && !storedUser.age && storedUser.phone);
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [myClinic, setMyClinic] = useState(null);
  
  const navigate = useNavigate();
  const user = currentUser;
  const token = localStorage.getItem('token');
  const userId = user?.id;
  const userRole = user?.role;
  const userCoords = user?.location?.coordinates;
  const userLng = userCoords?.[0];
  const userLat = userCoords?.[1];

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }
  }, [navigate, token, userId]);

  useEffect(() => {
    if (!token || !userId) return;

    let isCancelled = false;

    const loadDashboardData = async () => {
      try {
        const aptRes = await api.get('/api/appointments/list', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (isCancelled) return;
        setAppointments(aptRes.data.filter(a => a.status !== 'completed'));

        if (userRole === 'patient') {
          const nextRes = await api.get(`/api/appointments/upcoming/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (isCancelled) return;
          if (nextRes.data && nextRes.data._id) {
            setNextAppointment(nextRes.data);
          } else {
            setNextAppointment(null);
          }
        }

        if (userRole === 'patient' && userCoords) {
          const [lng, lat] = userCoords;
          const clRes = await api.get(`/api/appointments/nearby?lng=${lng}&lat=${lat}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (isCancelled) return;
          setClinics(clRes.data);
        } else if (!isCancelled) {
          setClinics([]);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Data fetch error", err);
        }
      }
    };

    loadDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [token, userId, userRole, userCoords, userLng, userLat]);

  useEffect(() => {
    if (userRole === 'clinic_admin' && token) {
      api.get('/api/clinics/my-clinic', { headers: { Authorization: `Bearer ${token}` }})
        .then(res => setMyClinic(res.data))
        .catch(err => console.error("Failed to load managed clinic", err));
    }
  }, [userRole, token]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filteredClinics = clinics.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/appointments/${id}`, { status }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showSuccess(`Status updated to ${status}`);
      window.location.reload();
    } catch (err) { console.error("Status update failed", err); }
  };

  const handlePayment = async (appointmentId) => {
    if(!window.confirm("Complete mock payment for $50.00?")) return;
    try {
      // 1. Create intent
      const intentRes = await api.post('/api/payments/intent', { appointmentId, amount: 50.00 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 2. Confirm payment
      await api.post('/api/payments/confirm', { transactionId: intentRes.data.transactionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Payment successful!');
      window.location.reload();
    } catch (err) {
      alert('❌ Payment failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#040810]">
      <Background3D />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[100]"
          >
            <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] font-bold flex items-center gap-3 border border-emerald-400/30">
              <Check size={18} />
              {successMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="border-b border-teal-500/10 bg-[#040810]/60 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 border border-teal-400/15 text-teal-300 text-sm font-semibold">
                {initials}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {user.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Portal'}
                </h1>
                <p className="text-sm text-slate-500">
                  Welcome, <span className="text-slate-300">{user?.name || 'User'}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/blood-bank')} 
                className="btn-secondary text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              >
                <Droplet size={15} />
                <span className="hidden sm:inline">Blood Bank</span>
              </button>
              {user.role === 'patient' && (
                <button 
                  onClick={() => navigate('/medical-vault')} 
                  className="btn-secondary text-xs"
                >
                  <FileText size={15} />
                  <span className="hidden sm:inline">Medical Vault</span>
                </button>
              )}
              {user.role === 'clinic_admin' ? (
                <button 
                  onClick={() => navigate('/clinic-registration')} 
                  className="btn-secondary text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20"
                >
                  <ShieldCheck size={15} />
                  <span className="hidden sm:inline">Clinic Settings</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/clinic-registration')} 
                  className="btn-secondary text-xs"
                >
                  <Activity size={15} />
                  <span className="hidden sm:inline">Add Clinic</span>
                </button>
              )}
              <button 
                onClick={() => navigate('/profile')} 
                className="btn-secondary text-xs"
              >
                <User size={15} />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button 
                onClick={handleLogout} 
                className="btn-danger text-xs"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        
        {/* Next Appointment Banner */}
        <AnimatePresence>
          {user.role === 'patient' && nextAppointment && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 rounded-3xl border border-teal-400/20 bg-teal-400/[0.05] p-5 shadow-[0_0_30px_rgba(45,212,191,0.05)] backdrop-blur-md overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/20 border border-teal-400/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                    <Calendar className="text-teal-300" size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-100 tracking-wide uppercase">Upcoming Appointment</p>
                    <p className="text-[1.05rem] text-white mt-1 font-medium">
                      {nextAppointment.doctorName} <span className="text-teal-500/50 mx-2">|</span> <span className="text-teal-200">{new Date(nextAppointment.scheduledDate || nextAppointment.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
                    </p>
                  </div>
                </div>
                <Clock size={24} className="text-teal-400/30 hidden sm:block" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Nearby Doctors (Patients) */}
          {user.role === 'patient' && (
            <div className="lg:col-span-1 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin size={15} className="text-teal-400" />
                  Nearby Doctors
                </h2>
                <span className="text-xs font-medium text-teal-300 bg-teal-400/10 px-2.5 py-1 rounded-lg border border-teal-400/15">
                  {filteredClinics.length}
                </span>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or specialty..."
                  className="w-full text-sm bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all backdrop-blur-md"
                />
              </div>

              {/* Doctor Cards */}
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredClinics.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/[0.1] rounded-3xl text-slate-500 bg-white/[0.01]">
                    <MapPin size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No doctors found</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredClinics.map((doctor, idx) => (
                      <motion.button
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={doctor._id}
                      onClick={() => setSelectedDoc(doctor)}
                      className="w-full text-left rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4 transition-all duration-200 hover:border-teal-400/15 hover:bg-white/[0.03] group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white group-hover:text-teal-200 transition-colors truncate">
                            {doctor.name}
                            {doctor.isExternal && <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 align-middle">External API</span>}
                          </h4>
                          <p className="text-xs text-teal-400/80 mt-0.5">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/15">
                          <span className="text-amber-400 text-xs font-medium">★ {doctor.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500">
                        {!doctor.isExternal && (
                          <div className="flex items-center gap-1.5 bg-white/[0.02] rounded-lg px-2.5 py-1.5">
                            <Users size={12} className="text-teal-400/60" /> {doctor.queueCount} in queue
                          </div>
                        )}
                        {!doctor.isExternal && (
                          <div className="flex items-center gap-1.5 bg-white/[0.02] rounded-lg px-2.5 py-1.5">
                            <Clock size={12} className="text-teal-400/60" /> {doctor.estimatedWait}m wait
                          </div>
                        )}
                        <div className={`flex items-center gap-1.5 bg-white/[0.02] rounded-lg px-2.5 py-1.5 ${doctor.isExternal ? 'col-span-2' : ''}`}>
                          <MapPin size={12} className="text-rose-400/60" /> {doctor.distance}km
                          {doctor.isExternal && <span className="ml-auto text-slate-400 truncate">{doctor.address}</span>}
                        </div>
                        {!doctor.isExternal && (
                          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${doctor.isAvailable ? 'bg-emerald-500/[0.05] text-emerald-400' : 'bg-rose-500/[0.05] text-rose-400'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            {doctor.isAvailable ? 'Available' : 'Busy'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <span className="text-teal-300 text-xs font-semibold">View Details</span>
                        <ChevronRight size={14} className="text-teal-300" />
                      </div>
                    </motion.button>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {/* Appointments */}
          <div className={user.role === 'patient' ? "lg:col-span-2" : "lg:col-span-3"}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
              <Activity size={15} className="text-teal-400" />
              {user.role === 'doctor' ? 'Patient Queue' : user.role === 'clinic_admin' ? 'Managed Professionals' : 'My Appointments'}
            </h2>

            {user.role === 'clinic_admin' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-teal-500/[0.03] border border-teal-500/10 p-6 rounded-[2rem] backdrop-blur-md">
                   <div>
                     <h3 className="text-xl font-bold text-white">{myClinic?.name || 'Clinic Management'}</h3>
                     <p className="text-slate-400 text-sm">{myClinic?.address?.city}, {myClinic?.address?.state}</p>
                   </div>
                   <button 
                    onClick={() => setShowAddDoctorModal(true)}
                    className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-5 py-3 rounded-2xl font-bold transition shadow-lg shadow-teal-500/20"
                   >
                     <UserPlus size={18} />
                     <span>Onboard Doctor</span>
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myClinic?.doctors?.length === 0 ? (
                    <div className="md:col-span-2 text-center py-20 border border-dashed border-white/[0.08] rounded-3xl text-slate-500">
                      <Users size={40} className="mx-auto mb-4 opacity-20" />
                      <p>No doctors onboarded yet.</p>
                    </div>
                  ) : (
                    myClinic?.doctors?.map((doc, idx) => (
                      <motion.div 
                        key={doc._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-5 hover:border-teal-500/30 transition shadow-xl"
                      >
                         <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                             {doc.name.charAt(0)}
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500 bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20">{doc.specialty}</span>
                         </div>
                         <h4 className="text-white font-bold">{doc.name}</h4>
                         <p className="text-slate-500 text-xs mb-4">{doc.email}</p>
                         <div className="flex gap-2">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">Manage Schedule</button>
                         </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-3xl text-slate-500 bg-white/[0.01] backdrop-blur-sm">
                  <Activity size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-base font-medium">No active appointments</p>
                  <p className="text-sm mt-2 opacity-60">Your schedule is clear</p>
                </div>
              ) : (
                <AnimatePresence>
                  {appointments.map((apt, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={apt._id} 
                    className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 transition-all duration-200 hover:border-white/[0.08] group"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-white group-hover:text-teal-200 transition-colors">
                          {user.role === 'doctor' ? apt.patientName : apt.doctorName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs mt-2">
                          <span className="font-medium">Queue #{i + 1}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> Est. {(i + 1) * 15}m
                          </span>
                          {apt.reason && <span className="hidden md:inline text-slate-600">{apt.reason.substring(0, 30)}...</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-teal-400/15 bg-teal-400/[0.05] text-teal-300 capitalize">
                          {apt.status}
                        </span>
                        
                        {user.role === 'doctor' && (
                          <div className="flex gap-1.5 ml-auto md:ml-0">
                            {apt.status === 'pending' && (
                              <button 
                                onClick={() => updateStatus(apt._id, 'accepted')} 
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg transition-all duration-200"
                                title="Accept"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => setUploadAptId(uploadAptId === apt._id ? null : apt._id)}
                              className="btn-primary !w-auto !py-2 !px-4 text-xs"
                            >
                              Prescribe & Complete
                            </button>
                            <button 
                              onClick={() => updateStatus(apt._id, 'completed')} 
                              className="btn-secondary !w-auto !py-2 !px-4 text-xs hidden md:block"
                            >
                              Complete Only
                            </button>
                            <button 
                              onClick={() => updateStatus(apt._id, 'cancelled')} 
                              className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg transition-all duration-200"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        
                        {user.role === 'patient' && (apt.status === 'accepted' || apt.status === 'completed') && (
                          <div className="flex gap-2 ml-auto md:ml-0">
                            {apt.isPaid ? (
                              <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.1] text-emerald-400">
                                Paid
                              </span>
                            ) : (
                              <button 
                                onClick={() => handlePayment(apt._id)}
                                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all text-xs shadow-lg shadow-blue-500/20"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {uploadAptId === apt._id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/[0.06] w-full relative z-20"
                        >
                          <PrescriptionUpload 
                            appointmentId={apt._id} 
                            onSave={() => {
                              setUploadAptId(null);
                              window.location.reload();
                            }} 
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            </div>
            )}
          </div>
        </div>
      </main>

      {/* Doctor Modal */}
      {selectedDoc && (
        <DoctorModal
          doctor={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onBook={() => {
            setSelectedDoc(null);
            window.location.reload();
          }}
        />
      )}

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={currentUser}
        onProfileComplete={(updatedUser) => {
          setCurrentUser(updatedUser);
          setShowProfileModal(false);
        }}
      />

      {/* Medical AI ChatBot */}
      <MedicalChatBot />

      {/* Add Doctor Modal */}
      <AddDoctorModal 
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        clinicId={myClinic?._id}
        onDoctorAdded={() => {
          api.get('/api/clinics/my-clinic', { headers: { Authorization: `Bearer ${token}` }})
            .then(res => setMyClinic(res.data));
        }}
      />
    </div>
  );
}
