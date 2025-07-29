// MatchingScreen.js - AuraMatch compatibility results
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const MatchingScreen = ({ navigation, route }) => {
  const { userProfile } = route.params;
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  // Simulated matching data (replace with real AI/Qloo integration)
  const simulatedMatches = [
    {
      id: 1,
      name: 'Sarah Chen',
      university: 'STANFORD',
      major: 'Computer Science',
      year: 'Junior',
      compatibility: 94,
      auraMatch: 'Night Owl Creative',
      matchReasons: [
        '🎵 Both love indie playlists and late-night study sessions',
        '🌙 Compatible sleep schedules (both night owls)',
        '🧹 Similar cleanliness preferences (organized but lived-in)',
        '📚 Prefer quiet study environments with background music'
      ],
      lifestyle: {
        sleepSchedule: 'Night owl',
        studyHabits: 'Background music',
        cleanliness: 'Organized',
        socialLevel: 'Small gatherings'
      },
      bio: 'CS major who codes best at midnight ☕ Love indie music and cozy study spaces. Looking for someone who won\'t judge my 2am ramen habits!',
      interests: ['Coding', 'Indie Music', 'Coffee', 'Photography'],
      dealBreakers: ['Early morning people', 'Loud parties'],
    },
    {
      id: 2,
      name: 'Maya Patel',
      university: 'STANFORD',
      major: 'Psychology',
      year: 'Sophomore',
      compatibility: 87,
      auraMatch: 'Social Butterfly',
      matchReasons: [
        '🎉 Both enjoy having friends over occasionally',
        '🎧 Share electronic and pop music taste',
        '📖 Balance study time with social activities',
        '🏠 Want a lived-in, comfortable living space'
      ],
      lifestyle: {
        sleepSchedule: 'Flexible',
        studyHabits: 'Study groups',
        cleanliness: 'Somewhat messy',
        socialLevel: 'Love parties'
      },
      bio: 'Psych major who believes in work-hard, play-hard! 🎊 Love hosting study groups and weekend hangouts. Seeking a roomie who\'s down for both Netflix nights and spontaneous adventures!',
      interests: ['Psychology', 'Dancing', 'Cooking', 'Social Events'],
      dealBreakers: ['Complete silence', 'No guests policy'],
    },
    {
      id: 3,
      name: 'Alex Rivera',
      university: 'STANFORD',
      major: 'Environmental Science',
      year: 'Senior',
      compatibility: 91,
      auraMatch: 'Chill Vibes',
      matchReasons: [
        '🌱 Both value sustainability and mindful living',
        '🎶 Share similar music taste (indie, acoustic)',
        '📚 Prefer calm, focused study environments',
        '🧘 Both interested in work-life balance'
      ],
      lifestyle: {
        sleepSchedule: 'Early bird',
        studyHabits: 'Complete silence',
        cleanliness: 'Very organized',
        socialLevel: 'Quiet nights in'
      },
      bio: 'Environmental science senior passionate about sustainable living 🌍 Early riser who loves quiet mornings and acoustic music. Looking for a mindful roommate who appreciates calm spaces!',
      interests: ['Sustainability', 'Hiking', 'Acoustic Music', 'Reading'],
      dealBreakers: ['Late night noise', 'Wasteful habits'],
    }
  ];

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      setMatches(simulatedMatches);
      setIsAnalyzing(false);
      
      // Animate in first match
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);
  }, []);

  const handleSwipeLeft = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
      
      // Reset animations for next card
      slideAnim.setValue(screenWidth);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Alert.alert('No More Matches', 'You\'ve seen all your top matches! We\'ll find more compatible roommates soon.');
    }
  };

  const handleSwipeRight = () => {
    Alert.alert(
      'Great Choice! 💫',
      `You matched with ${matches[currentMatchIndex]?.name}! We'll send them a notification and you can start chatting soon.`,
      [
        { text: 'Keep Looking', onPress: handleSwipeLeft },
        { text: 'View Profile', onPress: () => console.log('View profile') }
      ]
    );
  };

  const getCompatibilityColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#FF9800';
    return '#2196F3';
  };

  const getCompatibilityLabel = (score) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Great Match';
    return 'Good Match';
  };

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.analyzingTitle}>Finding Your Perfect Matches</Text>
          <Text style={styles.analyzingSubtitle}>
            Our AI is analyzing your personality with thousands of potential roommates...
          </Text>
          <View style={styles.analyzingSteps}>
            <Text style={styles.analyzingStep}>🧠 Processing personality data...</Text>
            <Text style={styles.analyzingStep}>🎵 Matching music and lifestyle preferences...</Text>
            <Text style={styles.analyzingStep}>✨ Calculating compatibility scores...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesTitle}>No matches found</Text>
          <Text style={styles.noMatchesSubtitle}>
            We couldn't find compatible roommates right now. Try updating your preferences!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentMatch = matches[currentMatchIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your AuraMatches</Text>
        <Text style={styles.headerSubtitle}>
          {currentMatchIndex + 1} of {matches.length} top matches
        </Text>
      </View>

      {/* Match Card */}
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentMatch.name}</Text>
              <Text style={styles.profileDetails}>
                {currentMatch.major} • {currentMatch.year} • {currentMatch.university}
              </Text>
            </View>
            <View style={styles.compatibilityBadge}>
              <Text style={[
                styles.compatibilityScore,
                { color: getCompatibilityColor(currentMatch.compatibility) }
              ]}>
                {currentMatch.compatibility}%
              </Text>
              <Text style={styles.compatibilityLabel}>
                {getCompatibilityLabel(currentMatch.compatibility)}
              </Text>
            </View>
          </View>

          {/* Aura Match */}
          <View style={styles.auraMatchContainer}>
            <Text style={styles.auraMatchTitle}>AuraMatch™: {currentMatch.auraMatch}</Text>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{currentMatch.bio}</Text>
          </View>

          {/* Match Reasons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why You're Compatible</Text>
            {currentMatch.matchReasons.map((reason, index) => (
              <View key={index} style={styles.matchReason}>
                <Text style={styles.matchReasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* Lifestyle Comparison */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle Match</Text>
            <View style={styles.lifestyleGrid}>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Sleep Schedule</Text>
                <Text style={styles.lifestyleValue}>{currentMatch.lifestyle.sleepSchedule}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Study Habits</Text>
                <Text style={styles.lifestyleValue}>{currentMatch.lifestyle.studyHabits}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Cleanliness</Text>
                <Text style={styles.lifestyleValue}>{currentMatch.lifestyle.cleanliness}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Social Level</Text>
                <Text style={styles.lifestyleValue}>{currentMatch.lifestyle.socialLevel}</Text>
              </View>
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {currentMatch.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]} 
            onPress={handleSwipeLeft}
          >
            <Text style={styles.passButtonText}>Pass</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.matchButton]} 
            onPress={handleSwipeRight}
          >
            <Text style={styles.matchButtonText}>Connect! 💫</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  analyzingSteps: {
    marginTop: 40,
    alignItems: 'flex-start',
  },
  analyzingStep: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 12,
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileDetails: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  compatibilityBadge: {
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  compatibilityScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  auraMatchContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  auraMatchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  matchReason: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  matchReasonText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lifestyleItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  lifestyleLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  lifestyleValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  matchButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  matchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noMatchesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  noMatchesSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MatchingScreen;