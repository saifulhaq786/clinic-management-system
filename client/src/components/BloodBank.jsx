import React, { useState, useEffect } from 'react';
import { Droplet, MapPin, Phone, AlertTriangle, Plus, CheckCircle } from 'lucide-react';
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
    contactPhone: '',
    urgency: 'Normal'
  });
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Droplet className="text-red-500 fill-red-500" size={32} />
            Blood Bank & Donation
          </h2>
          <p className="text-[#94a3b8] mt-2">Find nearby blood requests or request blood for emergencies.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            <Plus size={20} /> Request Blood
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#1e293b]/40 border border-[#334155] p-6 rounded-2xl mb-8 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Droplet className="text-red-500" /> New Blood Request
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          
          <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Patient Name</label>
              <input required value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Blood Type</label>
              <select value={form.bloodType} onChange={e => setForm({...form, bloodType: e.target.value})} className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Hospital Name</label>
              <input required value={form.hospitalName} onChange={e => setForm({...form, hospitalName: e.target.value})} className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Location</label>
              <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, State" className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Units Required</label>
              <input type="number" min="1" required value={form.unitsRequired} onChange={e => setForm({...form, unitsRequired: e.target.value})} className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Contact Phone</label>
              <input required value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full bg-[#050810] border border-[#1e293b] p-3 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Urgency</label>
              <div className="flex gap-4">
                {['Normal', 'Urgent', 'Critical'].map(level => (
                  <label key={level} className={`flex-1 p-3 rounded-lg border text-center cursor-pointer transition ${form.urgency === level ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#050810] border-[#1e293b] text-gray-400 hover:border-gray-500'}`}>
                    <input type="radio" className="hidden" name="urgency" value={level} checked={form.urgency === level} onChange={() => setForm({...form, urgency: level})} />
                    {level}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition">
                Post Blood Request
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-[#0f172a] rounded-2xl border border-dashed border-[#1e293b]">
          <Droplet size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-white font-bold mb-2">No active blood requests</h3>
          <p className="text-gray-500 text-sm">Check back later or post a new request if needed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map(req => {
            const isMyRequest = req.requesterId._id === user.id;
            const alreadyPledged = req.donors.some(d => d.donorId === user.id);
            const progress = (req.donors.length / req.unitsRequired) * 100;

            return (
              <div key={req._id} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
                <div className={`p-1 ${req.urgency === 'Critical' ? 'bg-red-600' : req.urgency === 'Urgent' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl font-black text-red-500">
                        {req.bloodType}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{req.patientName}'s Request</h3>
                        <p className="text-gray-400 text-sm">{req.hospitalName}</p>
                      </div>
                    </div>
                    {req.urgency !== 'Normal' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 ${req.urgency === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                        <AlertTriangle size={12} /> {req.urgency}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" /> {req.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" /> 
                      {alreadyPledged || isMyRequest ? req.contactPhone : "Hidden (Pledge to view)"}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-400">Donors Pledged</span>
                      <span className="text-white font-bold">{req.donors.length} / {req.unitsRequired} Units</span>
                    </div>
                    <div className="w-full bg-[#1e293b] rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                  </div>

                  {!isMyRequest ? (
                    alreadyPledged ? (
                      <div className="w-full bg-green-500/20 text-green-500 font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> You pledged to help!
                      </div>
                    ) : (
                      <button 
                        onClick={() => handlePledge(req._id)}
                        className="w-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                      >
                        <Droplet size={18} /> Pledge to Donate
                      </button>
                    )
                  ) : (
                    <div className="w-full bg-blue-500/10 text-blue-400 py-3 rounded-xl text-center text-sm font-bold border border-blue-500/20">
                      Your Request
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
