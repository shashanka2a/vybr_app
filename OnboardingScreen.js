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

const OnboardingScreen = ({ navigation, user }) => {
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

  const showMatchingResults = () => {
    const resultsMessage = {
      id: messages.length + 1,
      text: "🎉 Perfect! I've analyzed your personality and I'm ready to find your ideal roommate matches. Let me save your profile and start the magic!",
      sender: 'ai',
      timestamp: new Date(),
      isResult: true,
    };
    
    setMessages(prev => [...prev, resultsMessage]);
    
    // Navigate to matching screen after delay
    setTimeout(() => {
      navigation.navigate('Matching', { userProfile });
    }, 3000);
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