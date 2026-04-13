const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendNotificationEmail = async (email, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${email}`);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

const sendAppointmentReminder = async (email, appointmentData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Appointment Reminder</h2>
      <p>Hi ${appointmentData.patientName},</p>
      <p>You have an appointment scheduled with <strong>${appointmentData.doctorName}</strong></p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
        <p><strong>Date:</strong> ${appointmentData.date}</p>
        <p><strong>Time:</strong> ${appointmentData.time}</p>
        <p><strong>Specialty:</strong> ${appointmentData.specialty}</p>
      </div>
      <p>Please arrive 10 minutes early.</p>
    </div>
  `;
  await sendNotificationEmail(email, 'Appointment Reminder - Elite Clinic', html);
};

const sendPrescriptionAlert = async (email, patientName, doctorName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>New Prescription Available</h2>
      <p>Hi ${patientName},</p>
      <p>Dr. ${doctorName} has sent you a new prescription.</p>
      <p>Log in to your Elite Clinic account to view and download the prescription.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
  await sendNotificationEmail(email, 'New Prescription - Elite Clinic', html);
};

module.exports = {
  sendNotificationEmail,
  sendAppointmentReminder,
  sendPrescriptionAlert,
};
