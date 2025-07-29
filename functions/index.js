// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Gmail transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',    // Your Gmail
    pass: 'your-app-password'        // Gmail App Password
  }
});

exports.sendEmailOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;
  
  if (!email.endsWith('.edu')) {
    throw new functions.https.HttpsError('invalid-argument', 'Only .edu emails allowed');
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in Firestore
  await admin.firestore().collection('otps').doc(email).set({
    otp: otp,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });
  
  // Send real email
  await transporter.sendMail({
    from: 'Vybr <noreply@vybr.com>',
    to: email,
    subject: 'Your Vybr Verification Code',
    html: `
      <h2>Welcome to Vybr!</h2>
      <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `
  });
  
  return { success: true };
});