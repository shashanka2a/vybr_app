// App.js - Clean main app with navigation
import React, { useState } from 'react';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MatchingScreen from './src/screens/MatchingScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('auth'); // 'auth', 'onboarding', 'matching'
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Handle successful authentication
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setCurrentScreen('onboarding');
  };

  // Handle completed onboarding
  const handleOnboardingComplete = (profileData) => {
    setUserProfile(profileData);
    setCurrentScreen('matching');
  };

  // Handle navigation back to onboarding
  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  // Handle restart (logout)
  const handleRestart = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentScreen('auth');
  };

  // Render current screen
  switch (currentScreen) {
    case 'auth':
      return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    
    case 'onboarding':
      return (
        <OnboardingScreen 
          user={currentUser}
          onComplete={handleOnboardingComplete}
          onBack={handleRestart}
        />
      );
    
    case 'matching':
      return (
        <MatchingScreen 
          user={currentUser}
          userProfile={userProfile}
          onBack={handleBackToOnboarding}
          onRestart={handleRestart}
        />
      );
    
    default:
      return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }
}