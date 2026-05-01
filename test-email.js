import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.EMAIL_PORT || '587', 10);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: 'testcc995@gmail.com',
      subject: 'Your Chikitsa Verification Code',
      text: `Your account verification code is: ${otpCode}. Please use this code to activate your Chikitsa account.`,
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 255, 255, 0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 16px;">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
          <circle cx="20" cy="10" r="2"/>
        </svg>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">Chikitsa Intelligence</h1>
      <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 15px; font-weight: 500;">Secure Identity Verification</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="margin: 0 0 20px 0; color: #334155; font-size: 18px; font-weight: 700;">Hello Test User,</p>
      <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">You are attempting to access the Chikitsa clinical platform. Please use the secure one-time passcode below to verify your identity.</p>
      
      <!-- OTP Box -->
      <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
        <span style="display: block; font-family: monospace; font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #0f172a; margin-left: 12px;">${otpCode}</span>
      </div>
      
      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 15px; line-height: 1.6;">This code is valid for <strong>15 minutes</strong>. If you did not request this code, please ignore this email and your account will remain secure.</p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Chikitsa AI Technologies</p>
      <p style="margin: 0; color: #cbd5e1; font-size: 12px;">© 2026 All rights reserved. Highly confidential clinical intelligence.</p>
    </div>
  </div>
</body>
</html>
`
    });
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

run();
