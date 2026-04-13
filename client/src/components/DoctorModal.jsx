import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Users, Briefcase, Calendar } from 'lucide-react';
import api from '../api';

export default function DoctorModal({ doctor, onClose, onBook }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleBooking = async () => {
    if (!selectedDate || !reason) {
      alert('Please select a date and enter a reason');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.post(
        '/api/appointments/book',
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
      alert('Failed to book: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0c1222] border border-white/[0.06] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 md:my-0 animate-fade-in-scale">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-600 to-teal-500 p-7 md:p-8">
          <div className="absolute inset-0 bg-white/[0.04]" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.06] rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Star size={20} className="text-amber-300" />
                </div>
                <div className="bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/25">
                  <p className="text-amber-300 text-sm font-medium">{doctor.rating} Rating</p>
                </div>
              </div>
              <h2 className="text-white text-2xl md:text-3xl font-semibold tracking-tight mb-1">{doctor.name}</h2>
              <p className="text-teal-100/80 text-sm flex items-center gap-2">
                <Briefcase size={15} /> {doctor.specialty}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-white/10 rounded-xl transition text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 max-h-[calc(80vh-180px)] overflow-y-auto">
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-teal-400/10 bg-teal-400/[0.04] p-4 transition hover:border-teal-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-teal-400/70" />
                <p className="text-slate-500 text-xs font-medium">Queue</p>
              </div>
              <p className="text-white text-xl font-semibold">{doctor.queueCount}</p>
            </div>

            <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4 transition hover:border-emerald-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-emerald-400/70" />
                <p className="text-slate-500 text-xs font-medium">Wait</p>
              </div>
              <p className="text-white text-xl font-semibold">{doctor.estimatedWait}m</p>
            </div>

            <div className="rounded-xl border border-rose-400/10 bg-rose-400/[0.04] p-4 transition hover:border-rose-400/20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-rose-400/70" />
                <p className="text-slate-500 text-xs font-medium">Distance</p>
              </div>
              <p className="text-white text-xl font-semibold">{doctor.distance}km</p>
            </div>

            <div className="rounded-xl border border-violet-400/10 bg-violet-400/[0.04] p-4 transition hover:border-violet-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-violet-400/70" />
                <p className="text-slate-500 text-xs font-medium">Reviews</p>
              </div>
              <p className="text-white text-xl font-semibold">{doctor.totalReviews}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase block mb-2">Professional Summary</label>
            <p className="text-slate-300 text-sm leading-relaxed">{doctor.bio || 'Professional healthcare provider with years of experience.'}</p>
          </div>

          {/* Booking */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar size={13} className="text-teal-400/70" /> Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Reason for Visit</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason..."
                className="resize-none h-24"
              />
              <p className="text-slate-600 text-xs">Be specific about symptoms to help the doctor prepare</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-white/[0.04]">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">⏳</span>
                  Booking...
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
