const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePrescriptionPDF = async (prescription, doctor, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `prescription_${prescription._id}_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, `../pdfs/${filename}`);

      // Ensure pdfs directory exists
      const pdfDir = path.join(__dirname, '../pdfs');
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('PRESCRIPTION', { align: 'center' });
      doc.fontSize(12).text('Elite Clinic Management System', { align: 'center' });
      doc.moveDown();

      // Doctor info
      doc.fontSize(10).font('Helvetica-Bold').text(`Doctor: ${doctor.name}`);
      doc.text(`Specialty: ${doctor.specialty}`);
      doc.text(`License: ${doctor.licenseNumber || 'N/A'}`);
      doc.moveDown();

      // Patient info
      doc.fontSize(10).font('Helvetica-Bold').text(`Patient: ${patient.name}`);
      doc.text(`Email: ${patient.email}`);
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
      doc.moveDown();

      // Medications
      doc.fontSize(12).font('Helvetica-Bold').text('MEDICATIONS');
      prescription.medicines.forEach((medicine, idx) => {
        doc.fontSize(10).font('Helvetica');
        doc.text(`${idx + 1}. ${medicine.name} - ${medicine.dosage}`);
        doc.text(`   Frequency: ${medicine.frequency}`);
        doc.text(`   Duration: ${medicine.duration}`);
        if (medicine.instructions) doc.text(`   Instructions: ${medicine.instructions}`);
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Bold').text('NOTES');
      doc.fontSize(10).font('Helvetica').text(prescription.notes || 'No additional notes');

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').text('This is an electronically generated prescription.', { align: 'center' });
      doc.text(`Generated on ${new Date().toISOString()}`, { align: 'center' });

      stream.on('finish', () => {
        resolve({ filename, filepath: `/pdfs/${filename}` });
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePrescriptionPDF };
