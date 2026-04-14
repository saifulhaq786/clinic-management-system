const twilio = require('twilio');
const nodemailer = require('nodemailer');

// ============ TWILIO SMS CONFIG ============
let twilioClient = null;

// Only initialize Twilio if credentials are properly configured
if (
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ [SMS] Twilio configured successfully');
  } catch (err) {
    console.error('❌ [SMS] Failed to initialize Twilio:', err.message);
    twilioClient = null;
  }
} else {
  console.log('⚠️  [SMS] Twilio not configured - using console mode only');
}

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+1234567890'; // From Twilio

// Send OTP via SMS
const sendOTP_SMS = async (phoneNumber, otp) => {
  if (!twilioClient) {
    console.log(`⚠️  [SMS] Twilio not configured. OTP: ${otp} for ${phoneNumber}`);
    return { success: false, message: 'SMS service not configured' };
  }

  try {
    console.log(`📱 [SMS] Sending OTP to ${phoneNumber}`);
    
    const message = await twilioClient.messages.create({
      body: `Your Elite Clinic OTP: ${otp}\n\nValid for 5 minutes.\nDo not share this code.`,
      from: TWILIO_PHONE,
      to: phoneNumber
    });

    console.log(`✅ [SMS] Sent successfully. SID: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (err) {
    console.error(`❌ [SMS] Failed to send OTP:`, err.message);
    return { success: false, error: err.message };
  }
};

// ============ NODEMAILER EMAIL CONFIG ============
let emailTransporter = null;

// Initialize email transporter with Gmail SMTP settings
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  // Use explicit SMTP settings for better compatibility on cloud platforms like Render
  emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS (port 587)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: { 
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, 
  });

  // Verify connection
  emailTransporter.verify((err, success) => {
    if (err) {
      console.error('❌ [EMAIL] Gmail connection failed:', err.message);
      console.log('⚠️  [EMAIL] Make sure you have:');
      console.log('  1. Gmail 2FA enabled');
      console.log('  2. Created an app password');
      console.log('  3. Added credentials to .env');
    } else {
      console.log('✅ [EMAIL] Gmail connected successfully');
    }
  });
} else {
  console.log('⚠️  [EMAIL] Gmail not configured - using console mode only');
}

// Send Email Verification
const sendVerificationEmail = async (email, verificationCode, userName = 'User') => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`⚠️  [EMAIL] Not configured. Verification code: ${verificationCode} for ${email}`);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    console.log(`📧 [EMAIL] Sending verification to ${email}`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; color: white;">
          <h1 style="color: #60a5fa; margin-bottom: 20px;">Elite Clinic - Email Verification</h1>
          
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Thank you for registering with Elite Clinic. Please verify your email address to complete your account setup.</p>
          
          <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">Your Verification Code:</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #60a5fa; letter-spacing: 3px;">${verificationCode}</p>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px;">This code is valid for <strong>15 minutes</strong>.</p>
          
          <p style="margin: 20px 0; color: #cbd5e1;">
            <strong>Security Note:</strong> Never share this code with anyone. Elite Clinic staff will never ask you for your verification code.
          </p>
          
          <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            If you didn't register for this account, please ignore this email.
          </p>
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            © 2026 Elite Clinic. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Elite Clinic - Email Verification',
      html: htmlContent
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Sent successfully. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [EMAIL] Failed:`, err.message);
    return { success: false, error: err.message };
  }
};

// Send Welcome Email
const sendWelcomeEmail = async (email, userName = 'User') => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`⚠️  [EMAIL] Welcome email not sent - service not configured`);
    return { success: false };
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; color: white;">
          <h1 style="color: #60a5fa; margin-bottom: 20px;">Welcome to Elite Clinic 🏥</h1>
          
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Your account has been successfully verified! You can now access all Elite Clinic features.</p>
          
          <div style="background-color: #1e3a8a; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #60a5fa;">
            <h3 style="margin-top: 0; color: #60a5fa;">What You Can Now Do:</h3>
            <ul style="color: #cbd5e1; margin: 10px 0;">
              <li>Book appointments with healthcare professionals</li>
              <li>Access your medical history and records</li>
              <li>Chat with doctors for consultations</li>
              <li>Manage prescriptions</li>
              <li>Make secure payments</li>
            </ul>
          </div>
          
          <p><strong>Need Help?</strong> Contact our support team at support@eliteclinic.com</p>
          
          <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            © 2026 Elite Clinic. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Elite Clinic! 🏥',
      html: htmlContent
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Welcome email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ [EMAIL] Welcome email failed:`, err.message);
    return { success: false };
  }
};

module.exports = {
  sendOTP_SMS,
  sendVerificationEmail,
  sendWelcomeEmail
};
