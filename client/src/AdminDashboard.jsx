import React, { useState, useEffect } from 'react';
import { Card, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, Calendar, TrendingUp, Activity } from 'lucide-react';
import api from './api';
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);

      const doctorsRes = await api.get('/api/admin/top-doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopDoctors(doctorsRes.data);

      const usersRes = await api.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) return <div className="p-8 text-center text-white">Loading...</div>;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0f172a] to-[#1e3a8a]/10 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] mb-8">
          📊 Admin Dashboard
        </h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#94a3b8] text-sm font-bold">Total Users</p>
                <p className="text-3xl font-black text-white mt-2">{stats.users.total}</p>
              </div>
              <Users size={40} className="text-[#3b82f6]" />
            </div>
          </div>

          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#94a3b8] text-sm font-bold">Total Revenue</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#34d399] mt-2">
                  ${stats.revenue.toFixed(2)}
                </p>
              </div>
              <DollarSign size={40} className="text-[#10b981]" />
            </div>
          </div>

          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#94a3b8] text-sm font-bold">Appointments</p>
                <p className="text-3xl font-black text-white mt-2">{stats.appointments.total}</p>
              </div>
              <Calendar size={40} className="text-[#f59e0b]" />
            </div>
          </div>

          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#94a3b8] text-sm font-bold">Completion Rate</p>
                <p className="text-3xl font-black text-white mt-2">
                  {stats.appointments.total > 0 ? ((stats.appointments.completed / stats.appointments.total) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <TrendingUp size={40} className="text-[#8b5cf6]" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📈 Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="_id" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">👥 User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Doctors', value: stats.users.doctors },
                    { name: 'Patients', value: stats.users.patients },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">⭐ Top Performing Doctors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#334155]/50">
                  <th className="text-[#94a3b8] font-bold p-3">Doctor Name</th>
                  <th className="text-[#94a3b8] font-bold p-3">Appointments</th>
                  <th className="text-[#94a3b8] font-bold p-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topDoctors.slice(0, 5).map((doc) => (
                  <tr key={doc._id} className="border-b border-[#1e293b] hover:bg-[#0f172a]/50 transition">
                    <td className="text-white font-medium p-3">{doc.doctor?.[0]?.name}</td>
                    <td className="text-[#60a5fa] font-bold p-3">{doc.appointmentCount}</td>
                    <td className="text-[#10b981] p-3">⭐ 4.8/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">👤 All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#334155]/50">
                  <th className="text-[#94a3b8] font-bold p-3">Name</th>
                  <th className="text-[#94a3b8] font-bold p-3">Role</th>
                  <th className="text-[#94a3b8] font-bold p-3">Email</th>
                  <th className="text-[#94a3b8] font-bold p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-[#1e293b] hover:bg-[#0f172a]/50 transition">
                    <td className="text-white font-medium p-3">{user.name}</td>
                    <td className={`font-bold p-3 ${user.role === 'doctor' ? 'text-[#60a5fa]' : 'text-[#ef4444]'}`}>
                      {user.role.toUpperCase()}
                    </td>
                    <td className="text-[#94a3b8] p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${user.isActive ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
