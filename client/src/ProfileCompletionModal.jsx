import React, { useState } from 'react';
import { User, X } from 'lucide-react';
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

      // Update localStorage
      const userInStorage = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...userInStorage, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Notify parent
      if (onProfileComplete) {
        onProfileComplete(updatedUser);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a]/95 border border-[#1e293b]/50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Complete Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[#94a3b8] text-xs font-bold uppercase mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#1e293b]/50 border border-[#334155] focus:border-[#3b82f6] p-3 rounded-lg text-white placeholder-[#64748b] outline-none transition"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-[#94a3b8] text-xs font-bold uppercase mb-2">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              min="1"
              max="120"
              className="w-full bg-[#1e293b]/50 border border-[#334155] focus:border-[#3b82f6] p-3 rounded-lg text-white placeholder-[#64748b] outline-none transition"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[#94a3b8] text-xs font-bold uppercase mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-[#334155] focus:border-[#3b82f6] p-3 rounded-lg text-white outline-none transition appearance-none cursor-pointer"
              required
            >
              <option value="Not Specified">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-[#94a3b8] text-xs font-bold uppercase mb-2">
              Blood Group (Optional)
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-[#334155] focus:border-[#3b82f6] p-3 rounded-lg text-white outline-none transition appearance-none cursor-pointer"
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

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <User size={18} />
                Save Profile
              </>
            )}
          </button>

          <p className="text-[#64748b] text-xs text-center">
            This information helps us provide better healthcare services
          </p>
        </form>
      </div>
    </div>
  );
}
