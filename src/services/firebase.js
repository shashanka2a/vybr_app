// src/services/firebase.js

import { Alert } from 'react-native';

class FirebaseOTPService {
  constructor() {
    this.otps = new Map();
    this.users = new Map();
  }

  // Simulate Firebase Function: sendEmailOTP
  async sendEmailOTP(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate .edu email
        if (!email.endsWith('.edu')) {
          reject({ code: 'invalid-argument', message: 'Only .edu emails allowed' });
          return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with expiration
        this.otps.set(email, {
          otp,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        console.log(`OTP sent to ${email}: ${otp}`);
        
        // Show OTP in alert for demo (in production, this would be sent via email)
        Alert.alert(
          'Email OTP Sent! 📧',
          `Your verification code has been sent to ${email}\n\nFor demo purposes: ${otp}\n\nCode expires in 10 minutes.`,
          [{ text: 'OK' }]
        );

        resolve({ success: true });
      }, 1500);
    });
  }

  // Simulate Firebase Function: verifyEmailOTP
  async verifyEmailOTP(email, otp) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const otpData = this.otps.get(email);

        if (!otpData) {
          reject({ code: 'not-found', message: 'OTP not found or expired' });
          return;
        }

        // Check if OTP matches and hasn't expired
        if (otpData.otp !== otp || otpData.expiresAt < new Date()) {
          reject({ code: 'invalid-argument', message: 'Invalid or expired OTP' });
          return;
        }

        // Create user record
        const uid = this.generateUID();
        const user = {
          uid,
          email,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          university: this.extractUniversity(email)
        };

        this.users.set(email, user);
        this.otps.delete(email); // Clean up OTP

        // Save user profile
        this.saveUserProfile(user);

        resolve({ 
          customToken: `custom_token_${uid}`, 
          uid,
          user 
        });
      }, 1000);
    });
  }

  // Simulate saving user profile to Firestore
  async saveUserProfile(user) {
    const profile = {
      ...user,
      onboardingCompleted: false,
      preferences: {},
      lifestyle: {},
      matches: [],
      profile: {
        university: user.university,
        year: '',
        major: '',
        bio: '',
        interests: [],
        lifestyle: {
          sleepTime: '',
          studyHabits: '',
          cleanliness: '',
          socialLevel: '',
          musicTaste: []
        }
      }
    };

    console.log('User profile saved to Firestore:', profile);
    return profile;
  }

  generateUID() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  extractUniversity(email) {
    const domain = email.split('@')[1];
    return domain.replace('.edu', '').replace(/\./g, ' ').toUpperCase();
  }

  // Get user data
  getUser(email) {
    return this.users.get(email);
  }

  // Update user profile after onboarding
  async updateUserProfile(uid, profileData) {
    // Find user by uid
    for (let [email, user] of this.users.entries()) {
      if (user.uid === uid) {
        const updatedUser = {
          ...user,
          ...profileData,
          onboardingCompleted: true,
          updatedAt: new Date().toISOString()
        };
        this.users.set(email, updatedUser);
        console.log('User profile updated:', updatedUser);
        return updatedUser;
      }
    }
    throw new Error('User not found');
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseOTPService();
export default firebaseService;