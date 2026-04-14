import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import MobileLogin from './MobileLogin';
import Dashboard from './Dashboard';
import Profile from './Profile';
import BloodBank from './components/BloodBank';
import MedicalVault from './components/MedicalVault';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mobile-login" element={<MobileLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blood-bank" element={<BloodBank />} />
        <Route path="/medical-vault" element={<div className="min-h-screen bg-[#050810] p-8 max-w-4xl mx-auto"><h2 className="text-3xl font-black text-white mb-6">Medical Vault</h2><MedicalVault /></div>} />
        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}