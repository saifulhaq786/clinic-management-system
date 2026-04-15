import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, Stethoscope } from 'lucide-react';
import api from '../api';

export default function MedicalVault() {
  const [vault, setVault] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!token || !user?.id) {
      navigate('/login');
      return;
    }
    let isCancelled = false;

    const loadVault = async () => {
      try {
        const res = await api.get('/api/appointments/list', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const completed = res.data.filter(a => a.status === 'completed');
        if (!isCancelled) {
          setVault(completed);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching vault:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadVault();

    return () => {
      isCancelled = true;
    };
  }, [navigate, token, user?.id]);

  if (loading) {
    return <div className="text-center text-[#64748b]">Loading medical records...</div>;
  }

  return (
    <div className="space-y-6">
      {vault.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#1e293b] rounded-2xl text-[#64748b]">
          <FileText size={32} className="mx-auto mb-4 opacity-50" />
          <p className="font-bold">No medical records yet</p>
        </div>
      ) : (
        vault.map(record => (
          <div key={record._id} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 hover:border-[#3b82f6] transition">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white font-black text-lg flex items-center gap-2">
                  <Stethoscope size={18} className="text-[#3b82f6]" />
                  Dr. {record.doctorName}
                </h4>
                <p className="text-[#64748b] text-sm mt-1">
                  <Calendar size={14} className="inline mr-1" />
                  {new Date(record.completedDate || record.updatedAt || record.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-4">
              
              {/* Reason */}
              <div>
                <p className="text-[#3b82f6] text-xs font-black uppercase mb-1">Reason for Visit</p>
                <p className="text-[#cbd5e1]">{record.reason}</p>
              </div>

              {/* Prescription */}
              {record.prescription && (
                <div>
                  <p className="text-[#3b82f6] text-xs font-black uppercase mb-1">Prescription</p>
                  <div className="bg-[#050810] p-4 rounded-lg border border-[#1e293b] text-[#cbd5e1] whitespace-pre-wrap">
                    {record.prescription}
                  </div>
                </div>
              )}

              {/* Doctor Notes */}
              {record.doctorNotes && (
                <div>
                  <p className="text-[#3b82f6] text-xs font-black uppercase mb-1">Doctor Notes</p>
                  <div className="bg-[#050810] p-4 rounded-lg border border-[#1e293b] text-[#cbd5e1] whitespace-pre-wrap">
                    {record.doctorNotes}
                  </div>
                </div>
              )}

              {/* Files */}
              {record.prescriptionFiles && record.prescriptionFiles.length > 0 && (
                <div>
                  <p className="text-[#3b82f6] text-xs font-black uppercase mb-2">Attached Reports</p>
                  <div className="space-y-2">
                    {record.prescriptionFiles.map((file, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-[#1e3a8a]/20 p-3 rounded-lg border border-[#1e3a8a]/30">
                          <FileText size={16} className="text-[#3b82f6]" />
                          <span className="text-[#cbd5e1] flex-1">{file.fileName}</span>
                          <a href={file.fileUrl} download={file.fileName} className="text-[#3b82f6] hover:text-white transition">
                            <Download size={16} />
                          </a>
                        </div>
                        {file.fileUrl?.startsWith('data:image/') && (
                          <div className="rounded-lg overflow-hidden border border-[#1e293b]">
                            <img src={file.fileUrl} alt={file.fileName} className="w-full object-cover max-h-64" />
                          </div>
                        )}
                        {file.fileUrl?.startsWith('data:application/pdf') && (
                          <div className="h-64 rounded-lg overflow-hidden border border-[#1e293b]">
                            <embed src={file.fileUrl} type="application/pdf" className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <button className="w-full py-2 bg-[#1e3a8a]/10 border border-[#1e3a8a]/30 text-[#60a5fa] rounded-lg font-bold hover:bg-[#1e3a8a]/20 transition">
              View Full Record
            </button>
          </div>
        ))
      )}
    </div>
  );
}
