import React, { useState } from 'react';
import { Upload, FileText, Save } from 'lucide-react';
import api from '../api';

export default function PrescriptionUpload({ appointmentId, onSave }) {
  const [prescription, setPrescription] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles.map(f => ({ file: f, name: f.name }))]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Convert all files to base64 data URL promises
      const filePromises = files.map(f => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f.file);
          reader.onload = () => resolve({ fileName: f.name, dataURL: reader.result });
          reader.onerror = error => reject(error);
        });
      });
      
      const prescriptionFiles = await Promise.all(filePromises);

      const res = await api.patch(
        `/api/appointments/${appointmentId}`,
        {
          prescription,
          doctorNotes,
          status: 'completed',
          prescriptionFiles
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Prescription saved to medical vault!');
      onSave();
    } catch (err) {
      alert('Failed to save prescription: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-black text-lg uppercase">Medical Record</h3>

      {/* Prescription Text */}
      <div>
        <label className="text-[#64748b] text-xs font-bold uppercase block mb-2">Prescription</label>
        <textarea
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          placeholder="Enter prescription details, medications, dosages..."
          className="w-full bg-[#050810] border border-[#1e293b] p-4 rounded-xl text-white focus:border-[#3b82f6] outline-none resize-none h-32"
        />
      </div>

      {/* Doctor Notes */}
      <div>
        <label className="text-[#64748b] text-xs font-bold uppercase block mb-2">Doctor Notes</label>
        <textarea
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Clinical observations, conclusions, follow-up recommendations..."
          className="w-full bg-[#050810] border border-[#1e293b] p-4 rounded-xl text-white focus:border-[#3b82f6] outline-none resize-none h-24"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="text-[#64748b] text-xs font-bold uppercase block mb-2">
          <FileText size={16} className="inline mr-1" /> Attach Lab Reports / Images
        </label>
        <div className="bg-[#050810] border-2 border-dashed border-[#1e293b] rounded-xl p-6 text-center hover:border-[#3b82f6] transition cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload size={24} className="text-[#3b82f6] mx-auto mb-2" />
            <p className="text-[#cbd5e1] font-bold">Click to upload or drag files</p>
            <p className="text-[#64748b] text-xs">PDF, Images, or any documents</p>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1e3a8a]/20 p-3 rounded-lg text-sm">
                <span className="text-[#cbd5e1]">{f.name}</span>
                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white py-3 rounded-xl font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save size={18} /> {loading ? 'Saving...' : 'Save to Medical Vault'}
      </button>
    </div>
  );
}
