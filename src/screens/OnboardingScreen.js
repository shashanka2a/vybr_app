// OnboardingScreen.js - GPT-powered personality assessment
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';

import openAIService from '../services/openai';
import qlooService from '../services/qloo';
import firebaseService from '../services/firebase';

const OnboardingScreen = ({ user, onComplete }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! I'm Vybr's AI assistant 🤖 I'm here to learn about your personality and lifestyle to find you the perfect roommate!",
      sender: 'ai',
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Let's start with something fun - what's your name and what are you studying?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState({
    name: '',
    major: '',
    year: '',
    sleepSchedule: '',
    studyHabits: '',
    cleanliness: '',
    socialLevel: '',
    musicTaste: [],
    hobbies: [],
    dealBreakers: [],
  });
  
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Quick reply suggestions based on current step
  const getQuickReplies = () => {
    switch (currentStep) {
      case 2: // Sleep schedule
        return ['Early bird (before 10pm)', 'Night owl (after midnight)', 'Flexible schedule'];
      case 3: // Study habits
        return ['Complete silence', 'Background music', 'Study groups', 'Cafe atmosphere'];
      case 4: // Cleanliness
        return ['Very organized', 'Somewhat messy', 'Lived-in feel', 'Deep clean weekly'];
      case 5: // Social level
        return ['Love parties', 'Small gatherings', 'Quiet nights in', 'Mix of both'];
      case 6: // Music taste
        return ['Pop', 'Hip-hop', 'Rock', 'Indie', 'Electronic', 'Classical', 'Everything'];
      default:
        return [];
    }
  };

  // Simulate AI typing and response
  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let aiResponse = '';
      let nextStep = currentStep;
      
      // AI responses based on conversation flow
      switch (currentStep) {
        case 1: // Name and major
          aiResponse = `Nice to meet you! ${userMessage.includes('studying') || userMessage.includes('major') ? 'That sounds interesting!' : ''} Now let's talk about daily routines - when do you usually go to bed? 🌙`;
          nextStep = 2;
          break;
        case 2: // Sleep schedule
          aiResponse = `Got it! Sleep compatibility is super important. How about studying - do you prefer complete silence or can you handle some background noise? 📚`;
          nextStep = 3;
          break;
        case 3: // Study habits
          aiResponse = `Perfect! Living space vibes are crucial too. How would you describe your cleanliness level? Are you super organized or more of a "lived-in" person? 🧹`;
          nextStep = 4;
          break;
        case 4: // Cleanliness
          aiResponse = `Thanks for being honest! Social energy is another big factor. Are you someone who loves having people over, or do you prefer quieter spaces? 🎉`;
          nextStep = 5;
          break;
        case 5: // Social level
          aiResponse = `Awesome! Music taste can really bring people together (or drive them apart 😅). What genres do you vibe with?`;
          nextStep = 6;
          break;
        case 6: // Music taste
          aiResponse = `Great taste! Just a few more questions to nail your perfect match. What are some hobbies or activities you love doing? 🎨`;
          nextStep = 7;
          break;
        default:
          aiResponse = `This is so helpful! I'm getting a great sense of your personality. Let me analyze all this to find your perfect roommate match... ✨`;
          nextStep = 'complete';
      }
      
      const newMessage = {
        id: messages.length + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentStep(nextStep);
      setIsTyping(false);
      
      // Animate new message
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // If complete, show results
      if (nextStep === 'complete') {
        setTimeout(() => {
          showMatchingResults();
        }, 2000);
      }
    }, 1500 + Math.random() * 1000); // Random delay for natural feel
  };

  const showMatchingResults = async () => {
    const resultsMessage = {
      id: messages.length + 1,
      text: "🎉 Perfect! I've analyzed your personality. Now let me find your ideal roommate matches using our advanced AI...",
      sender: 'ai',
      timestamp: new Date(),
      isResult: true,
    };
    
    setMessages(prev => [...prev, resultsMessage]);
    
    try {
      console.log('🚀 Starting matching process with real AI integration...');
      
      // Check if we have API keys
      const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
      const hasQlooKey = process.env.QLOO_API_KEY && process.env.QLOO_API_KEY !== '';
      
      console.log('🔑 API Keys available:', { 
        openai: hasOpenAIKey ? 'Yes' : 'No', 
        qloo: hasQlooKey ? 'Yes' : 'No' 
      });
      
      let personalityData, qlooProfile;
      
      if (hasOpenAIKey) {
        try {
          // Try real OpenAI integration
          console.log('🤖 Using real OpenAI integration...');
          const openaiData = await openAIService.completeOnboarding();
          const qlooCompatibleData = openAIService.getQlooCompatibleData();
          personalityData = qlooCompatibleData.personality;
          console.log('✅ OpenAI personality analysis complete:', personalityData);
          
          if (hasQlooKey) {
            // Try real Qloo integration
            console.log('🧬 Using real Qloo integration...');
            const tasteProfile = qlooService.createTasteProfile(
              qlooCompatibleData.responses, 
              qlooCompatibleData.personality
            );
            qlooProfile = await qlooService.createQlooProfile(tasteProfile);
            console.log('✅ Qloo profile created:', qlooProfile);
          } else {
            // Fallback Qloo profile
            qlooProfile = await qlooService.createSimulatedQlooProfile({
              preferences: { lifestyle: personalityData }
            });
            console.log('✅ Simulated Qloo profile created');
          }
        } catch (error) {
          console.warn('⚠️ OpenAI API failed, falling back to demo mode:', error);
          hasOpenAIKey = false; // Force fallback
        }
      }
      
      if (!hasOpenAIKey) {
        // Create demo personality data from conversation
        console.log('🎭 Using demo personality analysis...');
        personalityData = {
          sleepSchedule: currentStep >= 2 ? this.extractSleepScheduleFromMessages() : 'flexible',
          studyHabits: currentStep >= 3 ? this.extractStudyHabitsFromMessages() : 'flexible',
          cleanliness: currentStep >= 4 ? this.extractCleanlinessFromMessages() : 'moderate',
          socialLevel: currentStep >= 5 ? this.extractSocialLevelFromMessages() : 'moderate',
          major: this.extractMajorFromMessages() || 'Computer Science',
          university: user.university
        };
        
        qlooProfile = {
          profile_id: `demo_qloo_${user.uid}`,
          taste_vector: Array.from({ length: 50 }, () => Math.random() * 2 - 1),
          recommendations: {
            music: ['indie', 'electronic'],
            lifestyle_compatibility: personalityData
          }
        };
        
        console.log('✅ Demo personality data created:', personalityData);
      }
      
      // Update user profile in Firebase
      const completeProfileData = {
        openaiResponses: messages.filter(m => m.sender === 'user').map((m, i) => ({
          step: i + 1,
          answer: m.text,
          timestamp: m.timestamp
        })),
        personalityAnalysis: personalityData,
        qlooProfileId: qlooProfile.profile_id,
        tasteVector: qlooProfile.taste_vector,
        compatibilityPreferences: {
          lifestyle: personalityData
        },
        usingRealAI: hasOpenAIKey && hasQlooKey,
        completedAt: new Date().toISOString()
      };
      
      console.log('💾 Updating user profile in Firebase...');
      await firebaseService.updateUserProfile(user.uid, completeProfileData);
      console.log('✅ User profile updated');
      
      // Get available roommates for matching
      console.log('🔍 Getting available roommates...');
      const roommates = await firebaseService.getAvailableRoommates(user.uid);
      console.log(`✅ Found ${roommates.length} potential roommates from ${user.university}`);
      
      let compatibilityMatches = [];
      
      if (roommates.length === 0) {
        console.log('⚠️ No real roommates found, creating demo matches...');
        
        // Create demo matches for the user's university
        const demoMatches = this.createUniversitySpecificDemoMatches(user.university, personalityData);
        compatibilityMatches = demoMatches;
        
        const noRealMatchesMessage = {
          id: messages.length + 2,
          text: `I don't see any other ${user.university} students who have completed onboarding yet. Here are some demo profiles to show you how awesome the matching will be once more students join! 🎓`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noRealMatchesMessage]);
        
      } else {
        // Find compatible matches
        console.log('🎯 Finding compatible matches...');
        compatibilityMatches = await qlooService.findCompatibleRoommates(
          qlooProfile.profile_id,
          qlooProfile.taste_vector,
          roommates,
          personalityData
        );
        console.log('✅ Compatibility matches found:', compatibilityMatches);
        
        // Save matches to Firebase
        await firebaseService.saveCompatibilityMatches(user.uid, compatibilityMatches);
        console.log('💾 Matches saved to Firebase');
      }
      
      // Complete onboarding
      const completeData = {
        user: user,
        openaiAnalysis: { personality: personalityData },
        qlooProfile: qlooProfile,
        compatibilityMatches: compatibilityMatches,
        userProfile: completeProfileData,
        isDemo: roommates.length === 0,
        usingRealAI: hasOpenAIKey && hasQlooKey
      };
      
      console.log('🚀 Calling onComplete with data');
      
      setTimeout(() => {
        if (onComplete && typeof onComplete === 'function') {
          onComplete(completeData);
        } else {
          console.error('❌ onComplete is not a function:', onComplete);
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Matching process error:', error);
      
      // Ultimate fallback
      const fallbackData = {
        user: user,
        openaiAnalysis: { personality: { demo: true } },
        qlooProfile: { profile_id: 'error_fallback' },
        compatibilityMatches: this.createUniversitySpecificDemoMatches(user.university, {}),
        userProfile: { error: true, timestamp: new Date().toISOString() },
        isDemo: true,
        error: error.message
      };
      
      setTimeout(() => {
        if (onComplete && typeof onComplete === 'function') {
          onComplete(fallbackData);
        }
      }, 2000);
    }
  };

  // Helper functions to extract personality from messages
  const extractSleepScheduleFromMessages = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const sleepMessage = userMessages.find(m => 
      m.text.toLowerCase().includes('night') || 
      m.text.toLowerCase().includes('early') || 
      m.text.toLowerCase().includes('sleep')
    );
    
    if (sleepMessage) {
      if (sleepMessage.text.toLowerCase().includes('night') || sleepMessage.text.toLowerCase().includes('late')) {
        return 'night_owl';
      } else if (sleepMessage.text.toLowerCase().includes('early') || sleepMessage.text.toLowerCase().includes('morning')) {
        return 'early_bird';
      }
    }
    return 'flexible';
  };

  const extractStudyHabitsFromMessages = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const studyMessage = userMessages.find(m => 
      m.text.toLowerCase().includes('music') || 
      m.text.toLowerCase().includes('quiet') || 
      m.text.toLowerCase().includes('study')
    );
    
    if (studyMessage) {
      if (studyMessage.text.toLowerCase().includes('music') || studyMessage.text.toLowerCase().includes('background')) {
        return 'background_music';
      } else if (studyMessage.text.toLowerCase().includes('quiet') || studyMessage.text.toLowerCase().includes('silence')) {
        return 'quiet';
      }
    }
    return 'flexible';
  };

  const extractCleanlinessFromMessages = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const cleanMessage = userMessages.find(m => 
      m.text.toLowerCase().includes('clean') || 
      m.text.toLowerCase().includes('organized') || 
      m.text.toLowerCase().includes('messy')
    );
    
    if (cleanMessage) {
      if (cleanMessage.text.toLowerCase().includes('organized') || cleanMessage.text.toLowerCase().includes('very clean')) {
        return 'very_organized';
      } else if (cleanMessage.text.toLowerCase().includes('messy')) {
        return 'relaxed';
      }
    }
    return 'moderate';
  };

  const extractSocialLevelFromMessages = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const socialMessage = userMessages.find(m => 
      m.text.toLowerCase().includes('party') || 
      m.text.toLowerCase().includes('social') || 
      m.text.toLowerCase().includes('quiet') ||
      m.text.toLowerCase().includes('friends')
    );
    
    if (socialMessage) {
      if (socialMessage.text.toLowerCase().includes('party') || socialMessage.text.toLowerCase().includes('love social')) {
        return 'very_social';
      } else if (socialMessage.text.toLowerCase().includes('quiet') || socialMessage.text.toLowerCase().includes('alone')) {
        return 'quiet';
      }
    }
    return 'moderate';
  };

  const extractMajorFromMessages = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const majorMessage = userMessages.find(m => 
      m.text.toLowerCase().includes('computer') || 
      m.text.toLowerCase().includes('engineering') || 
      m.text.toLowerCase().includes('business') ||
      m.text.toLowerCase().includes('psychology') ||
      m.text.toLowerCase().includes('major') ||
      m.text.toLowerCase().includes('studying')
    );
    
    if (majorMessage) {
      const text = majorMessage.text.toLowerCase();
      if (text.includes('computer')) return 'Computer Science';
      if (text.includes('engineering')) return 'Engineering';
      if (text.includes('business')) return 'Business';
      if (text.includes('psychology')) return 'Psychology';
      if (text.includes('biology')) return 'Biology';
      if (text.includes('english')) return 'English';
      if (text.includes('math')) return 'Mathematics';
    }
    return 'Undeclared';
  };

  const createUniversitySpecificDemoMatches = (university, userPersonality) => {
    const baseMatches = [
      {
        roommate_id: `demo_${university}_1`,
        name: `Demo ${university} Student 1`,
        major: 'Psychology',
        year: 'Junior',
        university: university,
        bio: `${university} psychology major who loves collaborative studying! 📚`,
        interests: ['Psychology', 'Study Groups', 'Coffee', 'Music'],
        compatibility_score: 87,
        explanation: 'High compatibility based on study habits and social preferences',
        compatibility_reasons: [
          '📚 Both prefer collaborative study environments',
          '☕ Share love for coffee shop study sessions',
          '🎵 Similar music taste for background studying',
          '🏛️ Both attending the same university'
        ],
        lifestyle: userPersonality,
        aura_match: 'Study Buddy'
      },
      {
        roommate_id: `demo_${university}_2`,
        name: `Demo ${university} Student 2`,
        major: 'Engineering',
        year: 'Senior',
        university: university,
        bio: `${university} engineering senior with great organizational skills! ⚙️`,
        interests: ['Engineering', 'Technology', 'Fitness', 'Gaming'],
        compatibility_score: 82,
        explanation: 'Good compatibility with complementary strengths',
        compatibility_reasons: [
          '⚙️ Excellent organizational skills complement your style',
          '🎮 Shares similar interests in technology',
          '🏋️ Balanced lifestyle with fitness and studies',
          '🏛️ Fellow ${university} student'
        ],
        lifestyle: userPersonality,
        aura_match: 'Organized Achiever'
      }
    ];
    
    return baseMatches;
  };

  const sendMessage = (messageText = currentMessage) => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate AI response
    simulateAIResponse(messageText);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personality Assessment</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(currentStep / 7) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {typeof currentStep === 'number' ? currentStep : 7} of 7</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.sender === 'user' ? styles.userMessage : styles.aiMessage
          ]}>
            {message.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>🤖</Text>
              </View>
            )}
            <View style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.aiBubble,
              message.isResult && styles.resultBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userText : styles.aiText
              ]}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}
        
        {/* AI Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>🤖</Text>
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      {getQuickReplies().length > 0 && (
        <View style={styles.quickRepliesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {getQuickReplies().map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickReplyButton}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={currentMessage}
            onChangeText={setCurrentMessage}
            placeholder="Type your answer..."
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !currentMessage.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!currentMessage.trim()}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultBubble: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1a1a1a',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickReplyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  quickReplyText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;