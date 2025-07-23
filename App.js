// App.js - Firebase Email OTP Implementation
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

// For Expo Snack demo - simulating Firebase Functions
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
}

// Initialize Firebase OTP service
const firebaseOTP = new FirebaseOTPService();

export default function App() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [screen, setScreen] = useState('signup'); // 'signup', 'verify-otp', 'success'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [otpSentTime, setOtpSentTime] = useState(null);

  const handleEmailChange = useCallback((text) => {
    setEmail(text);
  }, []);

  const handleOtpChange = useCallback((text) => {
    setOtp(text);
  }, []);

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/.test(email);
  };

  // Send OTP to email
  const handleSendOTP = async () => {
    setMessage('');
    
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setMessage('Please use a valid .edu email address');
      return;
    }

    setLoading(true);

    try {
      await firebaseOTP.sendEmailOTP(email);
      setOtpSentTime(new Date());
      setMessage('OTP sent to your email!');
      
      setTimeout(() => {
        setScreen('verify-otp');
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('Send OTP error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.code === 'invalid-argument') {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and create user
  const handleVerifyOTP = async () => {
    setMessage('');
    
    if (!otp) {
      setMessage('Please enter the verification code');
      return;
    }

    if (otp.length !== 6) {
      setMessage('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const result = await firebaseOTP.verifyEmailOTP(email, otp);
      setCurrentUser(result.user);

      setMessage('Email verified successfully!');
      setTimeout(() => {
        setScreen('success');
        setMessage('');
      }, 1000);

    } catch (error) {
      console.error('Verify OTP error:', error);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error.code === 'not-found') {
        errorMessage = 'Verification code not found or expired. Please request a new one.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    
    try {
      await firebaseOTP.sendEmailOTP(email);
      setOtpSentTime(new Date());
      setMessage('New verification code sent!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setMessage('Unable to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining for OTP
  const getTimeRemaining = () => {
    if (!otpSentTime) return '';
    const now = new Date();
    const elapsed = Math.floor((now - otpSentTime) / 1000);
    const remaining = Math.max(0, 600 - elapsed); // 10 minutes
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return remaining > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : 'Expired';
  };

  // Email input screen
  if (screen === 'signup') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Vybr</Text>
          <Text style={styles.subtitle}>Find your vibe</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>College Email</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@university.edu"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>

          {message ? (
            <Text style={[styles.message, message.includes('sent') ? styles.successMessage : styles.errorMessage]}>
              {message}
            </Text>
          ) : null}

          <Text style={styles.info}>
            We'll send a 6-digit verification code to your .edu email address.
          </Text>

          <Text style={styles.demoText}>
            🔐 Email OTP Authentication - Firebase Functions + Nodemailer
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // OTP verification screen
  if (screen === 'verify-otp') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to:{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              textAlign="center"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.otpInfoContainer}>
            <Text style={styles.otpTimer}>
              Time remaining: {getTimeRemaining()}
            </Text>
            
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>
          </View>

          {message ? (
            <Text style={[styles.message, message.includes('successfully') || message.includes('sent') ? styles.successMessage : styles.errorMessage]}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => setScreen('signup')}
          >
            <Text style={styles.linkText}>← Use Different Email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success screen
  if (screen === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>Welcome to Vybr!</Text>
          <Text style={styles.subtitle}>
            Email verified successfully!{'\n'}
            University: {currentUser?.university}
          </Text>

          <View style={styles.dbStatusContainer}>
            <Text style={styles.dbStatusTitle}>✅ Account Created:</Text>
            <Text style={styles.dbStatusItem}>• User ID: {currentUser?.uid?.substring(0, 8)}...</Text>
            <Text style={styles.dbStatusItem}>• Email: Verified via OTP</Text>
            <Text style={styles.dbStatusItem}>• Profile: Saved to Firestore</Text>
            <Text style={styles.dbStatusItem}>• Ready for: GPT Onboarding</Text>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => Alert.alert(
              'Next: GPT Personality Matching', 
              '🤖 Conversational preference collection\n🎵 Music & lifestyle compatibility\n🧬 Qloo Taste AI integration\n✨ AuraMatch compatibility scoring\n\nReady to build the matching algorithm?'
            )}
          >
            <Text style={styles.buttonText}>Start Personality Matching</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => {
              setScreen('signup');
              setEmail('');
              setOtp('');
              setCurrentUser(null);
              setMessage('');
              setOtpSentTime(null);
            }}
          >
            <Text style={styles.linkText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  otpInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpTimer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  demoText: {
    fontSize: 14,
    color: '#ff6b00',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    textAlign: 'center',
  },
  dbStatusContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  dbStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  dbStatusItem: {
    fontSize: 14,
    color: '#1b5e20',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  successMessage: {
    color: '#2e7d32',
    backgroundColor: '#e8f5e8',
  },
});