import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit3, Save, X, Activity } from 'lucide-react';
import MedicalVault from './components/MedicalVault';
import PrescriptionUpload from './components/PrescriptionUpload';
import api from './api';
import { isPhoneOnlyAccount } from './authSession';

export default function Profile() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('settings'); 
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const token = localStorage.getItem('token');

  const [editForm, setEditForm] = useState({ 
    name: user?.name || '',
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || 'Not Specified',
    bloodGroup: user?.bloodGroup || ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await api.get('/api/appointments/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(user?.role === 'doctor' ? res.data : res.data.filter(apt => apt.status === 'completed'));
      } catch (err) { 
        console.error("Error:", err);
      }
    };
    fetchAppointments();
  }, [navigate, token, user?.role]); 

  const handleUpdateProfile = async () => {
    try {
      const res = await api.patch('/api/auth/update', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditForm({
        name: updatedUser?.name || '',
        bio: updatedUser?.bio || '',
        specialty: updatedUser?.specialty || '',
        phone: updatedUser?.phone || '',
        age: updatedUser?.age || '',
        gender: updatedUser?.gender || 'Not Specified',
        bloodGroup: updatedUser?.bloodGroup || ''
      });
      setIsEditing(false);
      alert('Profile updated!');
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-12" style={{ background: '#060b18' }}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-secondary text-xs"
          >
            <ChevronLeft size={15} /> Back to Dashboard
          </button>
          
          {/* Tab navigation */}
          <div className="flex bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 gap-1">
            {user.role === 'doctor' ? (
              <>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'settings' ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20' : 'text-slate-500 hover:text-white border border-transparent'}`}
                >
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('patients')}
                  className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'patients' ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20' : 'text-slate-500 hover:text-white border border-transparent'}`}
                >
                  Patients
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'settings' ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20' : 'text-slate-500 hover:text-white border border-transparent'}`}
                >
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('vault')}
                  className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'vault' ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20' : 'text-slate-500 hover:text-white border border-transparent'}`}
                >
                  Medical Vault
                </button>
              </>
            )}
          </div>
        </div>

        {/* TAB: PROFILE */}
        {activeTab === 'settings' && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
            
            {/* Edit form */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Profile Details</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="text-slate-400 hover:text-teal-300 transition p-2 rounded-lg hover:bg-white/[0.04]"
                >
                  {isEditing ? <X size={18} /> : <Edit3 size={18} />}
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Phone</label>
                  <input 
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Phone"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Age</label>
                    <input 
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Age"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Gender</label>
                    <select 
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      disabled={!isEditing}
                    >
                      <option>Not Specified</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Blood Group</label>
                  <input 
                    type="text"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                    disabled={!isEditing}
                    placeholder="e.g. O+, A-, B+"
                  />
                </div>

                {user.role === 'doctor' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Specialty</label>
                      <input 
                        type="text"
                        value={editForm.specialty}
                        onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Specialty"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Bio</label>
                      <textarea 
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        disabled={!isEditing}
                        placeholder="About you..."
                        className="resize-none h-20"
                      />
                    </div>
                  </>
                )}

                {isEditing && (
                  <button 
                    onClick={handleUpdateProfile}
                    className="btn-primary mt-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="rounded-2xl border border-teal-400/10 bg-teal-400/[0.03] p-6 lg:p-8">
              <h3 className="text-sm font-medium text-teal-300 mb-5">Account Information</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email</span>
                  <span className="text-white font-medium text-right truncate ml-4">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Role</span>
                  <span className="text-white font-medium capitalize">{user.role}</span>
                </div>
                {user.role === 'doctor' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Rating</span>
                      <span className="text-amber-400 font-medium">★ {user.rating || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Available
                      </span>
                    </div>
                  </>
                )}
              </div>

              {isPhoneOnlyAccount(user) && (
                <div className="mt-6 rounded-xl border border-teal-400/15 bg-teal-400/[0.06] p-5">
                  <p className="text-xs font-medium tracking-wide text-teal-300/70 uppercase">Upgrade Account</p>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Add an email and password for easier access and Google linking.
                  </p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="btn-primary mt-4 text-xs"
                  >
                    Add Email Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: MEDICAL VAULT (PATIENTS) */}
        {activeTab === 'vault' && user.role === 'patient' && <MedicalVault />}

        {/* TAB: PATIENTS (DOCTORS) */}
        {activeTab === 'patients' && user.role === 'doctor' && (
          <div className="space-y-3 animate-fade-in">
            {appointments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-2xl text-slate-600">
                <Activity size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No patient records</p>
              </div>
            ) : (
              appointments.map(apt => (
                <div key={apt._id} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 transition hover:border-white/[0.1]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-white font-medium text-base">{apt.patientName}</h4>
                      <p className="text-slate-500 text-sm mt-0.5">Reason: {apt.reason}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize ${apt.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-400/15' : 'text-teal-300 bg-teal-400/10 border border-teal-400/15'}`}>
                      {apt.status}
                    </span>
                  </div>

                  {apt.status === 'completed' ? (
                    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl text-sm text-slate-400">
                      {apt.prescription && <p className="mb-2"><strong className="text-slate-300">Rx:</strong> {apt.prescription}</p>}
                      {apt.doctorNotes && <p><strong className="text-slate-300">Notes:</strong> {apt.doctorNotes}</p>}
                    </div>
                  ) : (
                    <PrescriptionUpload 
                      appointmentId={apt._id}
                      onSave={() => {
                        api.get('/api/appointments/list', {
                          headers: { Authorization: `Bearer ${token}` }
                        }).then(r => setAppointments(r.data)).catch(e => console.error(e));
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
