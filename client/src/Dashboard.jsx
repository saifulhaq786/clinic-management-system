import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Activity, LogOut, Check, X, FileText, Clock, Users, Calendar, Briefcase, ChevronRight, User, Droplet } from 'lucide-react';
import DoctorModal from './components/DoctorModal';
import MedicalChatBot from './components/MedicalChatBot';
import ProfileCompletionModal from './ProfileCompletionModal';
import PrescriptionUpload from './components/PrescriptionUpload';
import api from './api';
import { getStoredUser } from './authSession';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploadAptId, setUploadAptId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const user = getStoredUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Provide a small grace period for the token to settle in localStorage
    const storedToken = localStorage.getItem('token');
    if (!storedToken && !token) {
      const timer = setTimeout(() => {
        if (!localStorage.getItem('token')) {
          navigate('/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    
    setCurrentUser(user);
    if (storedToken || token) {
      fetchData();
    }
    
    if (user && !user.age && user.phone) {
      setShowProfileModal(true);
    }
  }, [navigate, token, user]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const fetchData = async () => {
    try {
      const aptRes = await api.get('/api/appointments/list', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAppointments(aptRes.data.filter(a => a.status !== 'completed'));

      if (user?.role === 'patient') {
        const nextRes = await api.get(`/api/appointments/upcoming/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (nextRes.data && nextRes.data._id) {
          setNextAppointment(nextRes.data);
        }
      }

      if (user?.role === 'patient' && user?.location?.coordinates) {
        const [lng, lat] = user.location.coordinates;
        const clRes = await api.get(`/api/appointments/nearby?lng=${lng}&lat=${lat}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setClinics(clRes.data);
      }
    } catch (err) { console.error("Data fetch error", err); }
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
      fetchData();
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
      fetchData(); // Refresh UI
    } catch (err) {
      alert('❌ Payment failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileComplete = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.04) 0%, transparent 60%), #060b18' }}>
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-fadeIn">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-500/20 font-bold flex items-center gap-3 border border-emerald-400/20 backdrop-blur-md">
            <Check size={18} />
            {successMsg}
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b border-white/[0.04] bg-[#060b18]/80 backdrop-blur-xl sticky top-0 z-30">
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
                  Welcome, <span className="text-slate-300">{user.name}</span>
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
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Next Appointment Banner */}
        {user.role === 'patient' && nextAppointment && (
          <div className="mb-8 rounded-2xl border border-teal-400/10 bg-teal-400/[0.04] p-5 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 border border-teal-400/15">
                  <Calendar className="text-teal-300" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Upcoming Appointment</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {nextAppointment.doctorName} · {new Date(nextAppointment.scheduledDate || nextAppointment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Clock size={18} className="text-teal-400/50 hidden sm:block" />
            </div>
          </div>
        )}

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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialty..."
                className="text-sm"
              />

              {/* Doctor Cards */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredClinics.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-2xl text-slate-600">
                    <MapPin size={28} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No doctors found</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </div>
                ) : (
                  filteredClinics.map(doctor => (
                    <button
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
                      <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-teal-300 text-xs">View Details</span>
                        <ChevronRight size={13} className="text-teal-300/60" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Appointments */}
          <div className={user.role === 'patient' ? "lg:col-span-2" : "lg:col-span-3"}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
              <Activity size={15} className="text-teal-400" />
              {user.role === 'doctor' ? 'Patient Queue' : 'My Appointments'}
            </h2>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl text-slate-600">
                  <Activity size={36} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-medium">No active appointments</p>
                  <p className="text-xs mt-1.5">Your schedule is clear</p>
                </div>
              ) : (
                appointments.map((apt, i) => (
                  <div 
                    key={apt._id} 
                    className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 transition-all duration-200 hover:border-white/[0.08] group animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
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
                        <div className="mt-4 pt-4 border-t border-white/[0.04] animate-fade-in w-full">
                          <PrescriptionUpload 
                            appointmentId={apt._id} 
                            onSave={() => {
                              setUploadAptId(null);
                              fetchData();
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
            fetchData();
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
    </div>
  );
}
