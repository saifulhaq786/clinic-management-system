import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit3, Save, X, Phone, Droplet, Activity, FileText } from 'lucide-react';
import MedicalVault from './components/MedicalVault';
import PrescriptionUpload from './components/PrescriptionUpload';

export default function Profile() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('settings'); 
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const token = localStorage.getItem('token');

  const [editForm, setEditForm] = useState({ 
    name: '', bio: '', specialty: '', phone: '', age: '', gender: 'Not Specified', bloodGroup: '' 
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setEditForm({ 
      name: user?.name || '', 
      bio: user?.bio || '', 
      specialty: user?.specialty || '',
      phone: user?.phone || '',
      age: user?.age || '',
      gender: user?.gender || 'Not Specified',
      bloodGroup: user?.bloodGroup || ''
    });

    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/appointments/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(user.role === 'doctor' ? res.data : res.data.filter(apt => apt.status === 'completed'));
      } catch (err) { 
        console.error("Error:", err);
      }
    };
    fetchAppointments();
  }, [navigate, token, user?.role]); 

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.patch('http://localhost:5001/api/auth/update', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated!');
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050810] text-[#cbd5e1] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#3b82f6] font-black uppercase text-xs tracking-widest hover:text-white transition-all bg-[#1e3a8a]/20 px-4 py-2 rounded-xl border border-[#1e3a8a]/30">
            <ChevronLeft size={16}/> Back
          </button>
          
          <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-1 gap-1">
            {user.role === 'doctor' ? (
              <>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-[#2563eb] text-white' : 'text-[#64748b] hover:text-white'}`}
                >
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('patients')}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'patients' ? 'bg-[#2563eb] text-white' : 'text-[#64748b] hover:text-white'}`}
                >
                  Patients
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-[#2563eb] text-white' : 'text-[#64748b] hover:text-white'}`}
                >
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('vault')}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vault' ? 'bg-[#2563eb] text-white' : 'text-[#64748b] hover:text-white'}`}
                >
                  Medical Vault
                </button>
              </>
            )}
          </div>
        </div>

        {/* TAB: PROFILE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1a1f35] border border-[#1e293b] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-black uppercase">Profile</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="text-[#3b82f6] hover:text-white transition-all"
                >
                  {isEditing ? <X size={20} /> : <Edit3 size={20} />}
                </button>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Full Name"
                  className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none"
                />

                <input 
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Phone"
                  className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Age"
                    className="bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none"
                  />
                  <select 
                    value={editForm.gender}
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    disabled={!isEditing}
                    className="bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none"
                  >
                    <option>Not Specified</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <input 
                  type="text"
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Blood Group"
                  className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none"
                />

                {user.role === 'doctor' && (
                  <>
                    <input 
                      type="text"
                      value={editForm.specialty}
                      onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Specialty"
                      className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none"
                    />

                    <textarea 
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Bio"
                      className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white disabled:opacity-50 focus:border-[#3b82f6] outline-none resize-none h-20"
                    />
                  </>
                )}

                {isEditing && (
                  <button 
                    onClick={handleUpdateProfile}
                    className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white py-3 rounded-lg font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1e3a8a]/20 to-[#1e40af]/20 border border-[#1e3a8a]/30 rounded-2xl p-8">
              <h3 className="text-[#60a5fa] font-black uppercase text-sm mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#64748b]">Email</span><span className="text-white font-bold">{user.email}</span></div>
                <div className="flex justify-between"><span className="text-[#64748b]">Role</span><span className="text-white font-bold uppercase">{user.role}</span></div>
                {user.role === 'doctor' && (
                  <>
                    <div className="flex justify-between"><span className="text-[#64748b]">Rating</span><span className="text-yellow-400 font-black">⭐ {user.rating || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-[#64748b]">Status</span><span className="text-green-400 font-bold">🟢 Available</span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEDICAL VAULT (PATIENTS) */}
        {activeTab === 'vault' && user.role === 'patient' && <MedicalVault />}

        {/* TAB: PATIENTS (DOCTORS) */}
        {activeTab === 'patients' && user.role === 'doctor' && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#1e293b] rounded-2xl text-[#64748b]">
                <Activity size={32} className="mx-auto mb-3 opacity-50" />
                <p className="font-bold uppercase">No patient records</p>
              </div>
            ) : (
              appointments.map(apt => (
                <div key={apt._id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 hover:border-[#3b82f6] transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-white font-black text-lg">{apt.patientName}</h4>
                      <p className="text-[#64748b] text-sm">Reason: {apt.reason}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase ${apt.status === 'completed' ? 'text-green-400 bg-green-900/20' : 'text-blue-400 bg-blue-900/20'}`}>
                      {apt.status}
                    </span>
                  </div>

                  {apt.status === 'completed' ? (
                    <div className="bg-[#050810] p-4 rounded-lg border border-[#1e293b] text-sm text-[#cbd5e1]">
                      {apt.prescription && <p className="mb-2"><strong>Rx:</strong> {apt.prescription}</p>}
                      {apt.doctorNotes && <p><strong>Notes:</strong> {apt.doctorNotes}</p>}
                    </div>
                  ) : (
                    <PrescriptionUpload 
                      appointmentId={apt._id}
                      onSave={() => {
                        axios.get('http://localhost:5001/api/appointments/list', {
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