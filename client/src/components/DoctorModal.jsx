import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, Users, Briefcase, Calendar } from 'lucide-react';
import axios from 'axios';

export default function DoctorModal({ doctor, onClose, onBook }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleBooking = async () => {
    if (!selectedDate || !reason) {
      alert('Please select a date and reason');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(
        'http://localhost:5001/api/appointments/book',
        {
          doctorId: doctor._id,
          doctorName: doctor.name,
          patientName: user.name || 'Patient',
          reason,
          scheduledDate: selectedDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment booked successfully!');
      onClose();
      onBook();
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message);
      alert('Failed to book appointment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1a1f35] border border-[#1e293b]/50 rounded-3xl md:rounded-4xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 md:my-0 animate-fade-in">
        
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-[#2563eb] via-[#1e40af] to-[#1e40af] p-8 md:p-10">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Star size={24} className="text-yellow-300" />
                </div>
                <div className="bg-yellow-500/20 px-3 py-1 rounded-lg border border-yellow-500/30">
                  <p className="text-yellow-400 font-black text-sm">{doctor.rating} Rating</p>
                </div>
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight mb-2">{doctor.name}</h2>
              <p className="text-[#dbeafe] text-sm md:text-base font-bold flex items-center gap-2">
                <Briefcase size={18} className="text-blue-200" /> {doctor.specialty}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur"
              title="Close"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 space-y-8 max-h-[calc(80vh-200px)] overflow-y-auto custom-scrollbar">
          
          {/* Premium Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Queue Stat */}
            <div className="bg-gradient-to-br from-[#1e3a8a]/40 to-[#1e40af]/20 hover:from-[#1e3a8a]/60 hover:to-[#1e40af]/40 border border-[#1e3a8a]/50 p-5 rounded-2xl transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 group-hover:bg-[#3b82f6]/40 transition-all flex items-center justify-center">
                  <Users size={16} className="text-[#60a5fa]" />
                </div>
                <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest">Queue</p>
              </div>
              <p className="text-white text-2xl md:text-3xl font-black">{doctor.queueCount}</p>
              <p className="text-[#64748b] text-xs mt-1">patients ahead</p>
            </div>

            {/* Wait Time Stat */}
            <div className="bg-gradient-to-br from-[#15803d]/40 to-[#16a34a]/20 hover:from-[#15803d]/60 hover:to-[#16a34a]/40 border border-[#15803d]/50 p-5 rounded-2xl transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 group-hover:bg-green-500/40 transition-all flex items-center justify-center">
                  <Clock size={16} className="text-green-400" />
                </div>
                <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest">Wait Time</p>
              </div>
              <p className="text-white text-2xl md:text-3xl font-black">{doctor.estimatedWait}m</p>
              <p className="text-[#64748b] text-xs mt-1">estimated</p>
            </div>

            {/* Distance Stat */}
            <div className="bg-gradient-to-br from-[#dc2626]/40 to-[#ef4444]/20 hover:from-[#dc2626]/60 hover:to-[#ef4444]/40 border border-[#dc2626]/50 p-5 rounded-2xl transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 group-hover:bg-red-500/40 transition-all flex items-center justify-center">
                  <MapPin size={16} className="text-red-400" />
                </div>
                <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest">Distance</p>
              </div>
              <p className="text-white text-2xl md:text-3xl font-black">{doctor.distance}km</p>
              <p className="text-[#64748b] text-xs mt-1">from you</p>
            </div>

            {/* Reviews Stat */}
            <div className="bg-gradient-to-br from-[#a855f7]/40 to-[#d946ef]/20 hover:from-[#a855f7]/60 hover:to-[#d946ef]/40 border border-[#a855f7]/50 p-5 rounded-2xl transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/40 transition-all flex items-center justify-center">
                  <Star size={16} className="text-purple-400" />
                </div>
                <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest">Reviews</p>
              </div>
              <p className="text-white text-2xl md:text-3xl font-black">{doctor.totalReviews}</p>
              <p className="text-[#64748b] text-xs mt-1">patient ratings</p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-gradient-to-br from-[#1e293b]/50 to-[#0f172a]/50 border border-[#334155]/30 p-6 rounded-2xl">
            <label className="text-white text-xs font-black uppercase tracking-widest block mb-3">Professional Summary</label>
            <p className="text-[#cbd5e1] leading-relaxed text-sm md:text-base">{doctor.bio || 'Professional healthcare provider with years of experience.'}</p>
          </div>

          {/* Booking Section */}
          <div className="space-y-4">
            {/* Date & Time */}
            <div>
              <label className="text-white text-xs font-black uppercase tracking-widest block mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-[#3b82f6]" /> Select Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 font-medium"
              />
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="text-white text-xs font-black uppercase tracking-widest block mb-3">Reason for Visit</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full bg-[#1e293b]/30 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] p-4 rounded-2xl text-white placeholder-[#64748b] outline-none transition-all duration-300 resize-none h-28 font-medium"
              />
              <p className="text-[#64748b] text-xs mt-2 font-bold">Be specific about your symptoms to help the doctor prepare</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-[#334155]/30">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 md:py-4 bg-[#1e293b]/50 hover:bg-[#334155]/50 text-white rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 border border-[#334155]/30"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 px-6 py-3 md:py-4 bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:from-[#3b82f6] hover:to-[#2563eb] text-white rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="animate-spin">⏳</div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
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
