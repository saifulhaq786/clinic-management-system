import React, { useState } from 'react';
import { User, X, CheckCircle } from 'lucide-react';
import api from './api';

export default function ProfileCompletionModal({ isOpen, onClose, userData, onProfileComplete }) {
  const [name, setName] = useState(userData?.name || '');
  const [age, setAge] = useState(userData?.age || '');
  const [gender, setGender] = useState(userData?.gender || 'Not Specified');
  const [bloodGroup, setBloodGroup] = useState(userData?.bloodGroup || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!name || !age || !gender) {
        setError('Name, age, and gender are required');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await api.put(
        '/api/profile/complete',
        {
          name: name.trim(),
          age: parseInt(age),
          gender,
          bloodGroup: bloodGroup.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const userInStorage = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...userInStorage, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (onProfileComplete) {
        onProfileComplete(updatedUser);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0c1222] border border-white/[0.06] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Complete Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-400/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              min="1"
              max="120"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="Not Specified">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">Blood Group (Optional)</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">Not Specified</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={17} />
                Save Profile
              </>
            )}
          </button>

          <p className="text-slate-600 text-xs text-center">
            This information helps us provide better healthcare services
          </p>
        </form>
      </div>
    </div>
  );
}
