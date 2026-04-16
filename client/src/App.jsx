import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import MobileLogin from './MobileLogin';
import Dashboard from './Dashboard';
import Profile from './Profile';
import BloodBank from './components/BloodBank';
import MedicalVault from './components/MedicalVault';
import ClinicRegistration from './components/ClinicRegistration';
import DoctorRegistration from './components/DoctorRegistration';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mobile-login" element={<MobileLogin />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/blood-bank" element={<ProtectedRoute><BloodBank /></ProtectedRoute>} />
        <Route path="/medical-vault" element={<ProtectedRoute><div className="min-h-screen bg-[#050810] p-8 max-w-4xl mx-auto"><h2 className="text-3xl font-black text-white mb-6">Medical Vault</h2><MedicalVault /></div></ProtectedRoute>} />
        <Route path="/clinic-registration" element={<ProtectedRoute><ClinicRegistration /></ProtectedRoute>} />
        <Route path="/doctor-registration" element={<ProtectedRoute><DoctorRegistration /></ProtectedRoute>} />
        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
