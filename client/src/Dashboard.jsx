import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Activity, LogOut, Check, X, FileText, Clock, Users, Calendar, Briefcase, ChevronRight, Sparkles } from 'lucide-react';
import DoctorModal from './components/DoctorModal';
import MedicalChatBot from './components/MedicalChatBot';
import ProfileCompletionModal from './ProfileCompletionModal';
import api from './api';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [hoveredDoctor, setHoveredDoctor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    fetchData();
    
    // Check if profile is incomplete (logged in via mobile, age not set)
    if (user && !user.age && user.phone) {
      setShowProfileModal(true);
    }
  }, [navigate, token]);

  const fetchData = async () => {
    try {
      const aptRes = await api.get('/api/appointments/list', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAppointments(aptRes.data.filter(a => a.status !== 'completed'));

      // Get next appointment for patient
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

  // Filter clinics based on search query
  const filteredClinics = clinics.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/appointments/${id}`, { status }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchData();
    } catch (err) { console.error("Status update failed", err); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileComplete = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Update user in localStorage for consistency
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0f172a] to-[#1e3a8a]/10">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563eb]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1e40af]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[#1e293b]/50 backdrop-blur-xl bg-[#0f172a]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] tracking-tight">
                  {user.role === 'doctor' ? '🏥 Command Center' : '👤 Patient Portal'}
                </h1>
                <p className="text-[#94a3b8] text-sm font-bold mt-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#60a5fa]" />
                  Welcome back, <span className="text-white font-black">{user.name}</span>
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-[#1e3a8a]/30 to-[#1e40af]/20 hover:from-[#2563eb]/30 hover:to-[#3b82f6]/20 text-white border border-[#1e3a8a]/30 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <FileText size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex-1 md:flex-none px-4 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          {/* Next Appointment Alert (Patients Only) */}
          {user.role === 'patient' && nextAppointment && (
            <div className="mb-8 p-6 md:p-8 bg-gradient-to-r from-[#1e3a8a]/40 to-[#1e40af]/40 hover:from-[#1e3a8a]/50 hover:to-[#1e40af]/50 backdrop-blur-sm border border-[#1e3a8a]/50 rounded-3xl transition-all duration-300 group">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/50 flex items-center justify-center">
                    <Calendar className="text-[#60a5fa]" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm md:text-base uppercase tracking-wide">Upcoming Appointment</p>
                    <p className="text-[#cbd5e1] text-sm mt-1">{nextAppointment.doctorName} • {new Date(nextAppointment.scheduledDate || nextAppointment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Clock size={24} className="text-[#60a5fa] group-hover:animate-spin" style={{animationDuration: '3s'}} />
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Nearby Doctors Panel (Patients Only) */}
            {user.role === 'patient' && (
              <div className="lg:col-span-1 space-y-6">
                {/* Doctors Section Header */}
                <div>
                  <h2 className="text-white font-black text-lg md:text-xl uppercase tracking-tight flex items-center gap-2 mb-4">
                    <MapPin size={20} className="text-[#3b82f6]"/> 
                    Nearby Doctors
                    <span className="ml-auto text-[#60a5fa] text-sm font-bold bg-[#1e3a8a]/30 px-3 py-1 rounded-full border border-[#1e3a8a]/50">
                      {filteredClinics.length}
                    </span>
                  </h2>
                  
                  {/* Search Bar */}
                  <div className="relative group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or specialty..."
                      className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] text-white placeholder-[#64748b] p-4 rounded-2xl outline-none transition-all duration-300 font-medium"
                    />
                  </div>
                </div>

                {/* Doctors List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredClinics.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-[#1e293b] rounded-2xl text-[#64748b] text-sm font-bold">
                      <MapPin size={32} className="mx-auto mb-3 opacity-30" />
                      <p>No doctors found</p>
                      <p className="text-xs mt-1">Try adjusting your search</p>
                    </div>
                  ) : (
                    filteredClinics.map(doctor => (
                      <button
                        key={doctor._id}
                        onClick={() => setSelectedDoc(doctor)}
                        onMouseEnter={() => setHoveredDoctor(doctor._id)}
                        onMouseLeave={() => setHoveredDoctor(null)}
                        className="w-full text-left bg-gradient-to-br from-[#1e293b]/50 to-[#0f172a]/50 hover:from-[#1e3a8a]/50 hover:to-[#1e40af]/30 border border-[#334155]/30 hover:border-[#3b82f6]/50 p-4 rounded-2xl cursor-pointer transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-black text-sm group-hover:text-[#60a5fa] transition-colors">{doctor.name}</h4>
                            <p className="text-[#3b82f6] text-xs font-bold uppercase mt-1">{doctor.specialty}</p>
                          </div>
                          <div className="bg-yellow-500/20 px-2.5 py-1.5 rounded-lg">
                            <p className="text-yellow-400 font-black text-xs">⭐ {doctor.rating}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-[#64748b] mt-3">
                          <div className="flex items-center gap-2 bg-[#0f172a]/50 p-2 rounded-lg">
                            <Users size={14} className="text-[#60a5fa]" /> {doctor.queueCount}
                          </div>
                          <div className="flex items-center gap-2 bg-[#0f172a]/50 p-2 rounded-lg">
                            <Clock size={14} className="text-[#60a5fa]" /> {doctor.estimatedWait}m
                          </div>
                          <div className="flex items-center gap-2 bg-[#0f172a]/50 p-2 rounded-lg">
                            <MapPin size={14} className="text-red-500" /> {doctor.distance}km
                          </div>
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${doctor.isAvailable ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            <span className="text-xs font-bold">{doctor.isAvailable ? 'Available' : 'Busy'}</span>
                          </div>
                        </div>
                        <div className="hidden group-hover:flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[#334155]/30">
                          <span className="text-[#60a5fa] text-xs font-bold">View Details</span>
                          <ChevronRight size={14} className="text-[#60a5fa]" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Appointments Panel */}
            <div className={user.role === 'patient' ? "lg:col-span-2" : "lg:col-span-3"}>
              <div>
                <h2 className="text-white font-black text-lg md:text-xl uppercase tracking-tight flex items-center gap-2 mb-6">
                  <Activity size={20} className="text-[#3b82f6]"/>
                  {user.role === 'doctor' ? 'Queue' : 'My Appointments'}
                </h2>

                {/* Appointments List */}
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-[#1e293b] rounded-2xl text-[#64748b]">
                      <Activity size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-bold text-base">No active appointments</p>
                      <p className="text-sm mt-2">Your schedule is clear</p>
                    </div>
                  ) : (
                    appointments.map((apt, i) => (
                      <div 
                        key={apt._id} 
                        className="bg-gradient-to-r from-[#1e293b]/40 to-[#0f172a]/40 hover:from-[#1e3a8a]/40 hover:to-[#1e40af]/20 border border-[#334155]/30 hover:border-[#3b82f6]/50 p-6 rounded-2xl transition-all duration-300 group"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tight group-hover:text-[#60a5fa] transition-colors">
                              {user.role === 'doctor' ? apt.patientName : apt.doctorName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[#64748b] text-xs md:text-sm mt-3">
                              <span className="font-bold">Queue #{i + 1}</span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> Est. {(i + 1) * 15}m
                              </span>
                              {apt.reason && <span className="hidden md:inline">📋 {apt.reason.substring(0, 25)}...</span>}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <span className="text-xs font-black px-4 py-2 rounded-full border bg-[#1e3a8a]/30 text-[#60a5fa] border-[#1e3a8a]/50 uppercase tracking-widest">
                              {apt.status}
                            </span>
                            
                            {/* Doctor Controls */}
                            {user.role === 'doctor' && (
                              <div className="flex gap-2 ml-auto md:ml-0">
                                {apt.status === 'pending' && (
                                  <button 
                                    onClick={() => updateStatus(apt._id, 'accepted')} 
                                    className="p-2.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-600/30 rounded-lg transition-all duration-300"
                                    title="Accept"
                                  >
                                    <Check size={16}/>
                                  </button>
                                )}
                                <button 
                                  onClick={() => updateStatus(apt._id, 'completed')} 
                                  className="px-4 py-2.5 bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:from-[#3b82f6] hover:to-[#2563eb] text-white text-xs font-black rounded-lg transition-all duration-300"
                                >
                                  FINISH
                                </button>
                                <button 
                                  onClick={() => updateStatus(apt._id, 'cancelled')} 
                                  className="p-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-lg transition-all duration-300"
                                  title="Cancel"
                                >
                                  <X size={16}/>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
