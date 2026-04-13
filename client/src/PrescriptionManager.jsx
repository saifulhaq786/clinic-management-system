import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Download, AlertCircle } from 'lucide-react';

export default function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
  });
  const token = localStorage.getItem('token');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/prescriptions/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrescriptions(res.data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    }
    setLoading(false);
  };

  const handleCreatePrescription = async () => {
    try {
      await axios.post('http://localhost:5001/api/prescriptions/create', newPrescription, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Prescription created successfully!');
      fetchPrescriptions();
      setNewPrescription({
        patientId: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
      });
    } catch (error) {
      alert('❌ Failed to create prescription: ' + error.response?.data?.error);
    }
  };

  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/prescriptions/download/${prescriptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download prescription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050810] via-[#0f172a] to-[#1e3a8a]/10 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] mb-8">
          💊 Prescription Manager
        </h1>

        {/* Create Prescription Form */}
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create New Prescription</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Patient ID"
              value={newPrescription.patientId}
              onChange={(e) => setNewPrescription({ ...newPrescription, patientId: e.target.value })}
              className="w-full bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-4 rounded-lg"
            />

            <div className="space-y-3">
              <h3 className="text-white font-bold">Medicines</h3>
              {newPrescription.medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2">
                  <input
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(e) => {
                      const updatedMedicines = [...newPrescription.medicines];
                      updatedMedicines[idx].name = e.target.value;
                      setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
                    }}
                    className="bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-2 rounded"
                  />
                  <input
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => {
                      const updatedMedicines = [...newPrescription.medicines];
                      updatedMedicines[idx].dosage = e.target.value;
                      setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
                    }}
                    className="bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-2 rounded"
                  />
                  <input
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={(e) => {
                      const updatedMedicines = [...newPrescription.medicines];
                      updatedMedicines[idx].frequency = e.target.value;
                      setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
                    }}
                    className="bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-2 rounded"
                  />
                  <input
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => {
                      const updatedMedicines = [...newPrescription.medicines];
                      updatedMedicines[idx].duration = e.target.value;
                      setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
                    }}
                    className="bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-2 rounded"
                  />
                  <input
                    placeholder="Instructions"
                    value={med.instructions}
                    onChange={(e) => {
                      const updatedMedicines = [...newPrescription.medicines];
                      updatedMedicines[idx].instructions = e.target.value;
                      setNewPrescription({ ...newPrescription, medicines: updatedMedicines });
                    }}
                    className="bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-2 rounded"
                  />
                </div>
              ))}
            </div>

            <textarea
              placeholder="Additional notes"
              value={newPrescription.notes}
              onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
              className="w-full bg-[#1e293b]/30 border border-[#334155]/50 text-white placeholder-[#64748b] p-4 rounded-lg"
              rows="3"
            />

            <button
              onClick={handleCreatePrescription}
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1e40af] text-white font-bold py-3 rounded-lg transition-all"
            >
              ✅ Create Prescription
            </button>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Prescriptions</h2>
            <button
              onClick={fetchPrescriptions}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-4 py-2 rounded-lg transition"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-[#94a3b8]">Loading...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-[#94a3b8]">No prescriptions found</p>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="bg-[#0f172a] border border-[#334155]/50 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-white font-bold">📋 {prescription.medicines.map(m => m.name).join(', ')}</p>
                    <p className="text-[#94a3b8] text-sm">Patient: {prescription.patientId?.name}</p>
                    <p className="text-[#64748b] text-xs">Created: {new Date(prescription.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadPrescription(prescription._id)}
                    className="bg-[#10b981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
