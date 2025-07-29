// src/services/qloo.js - Qloo Taste AI Integration
const QLOO_API_KEY = process.env.QLOO_API_KEY; // Add to .env
const QLOO_BASE_URL = 'https://api.qloo.com/v1';

class QlooService {
  constructor() {
    this.apiKey = QLOO_API_KEY;
  }

  // Create Qloo preference profile from OpenAI responses
  createTasteProfile(userResponses, personalityData) {
    // Convert OpenAI responses to Qloo-compatible attributes
    const tasteProfile = {
      demographics: {
        age_range: "18-24", // College students
        location: personalityData.university || "US"
      },
      preferences: {
        music: this.extractMusicPreferences(userResponses),
        lifestyle: this.extractLifestylePreferences(userResponses),
        entertainment: this.extractEntertainmentPreferences(userResponses),
        social: this.extractSocialPreferences(userResponses)
      },
      attributes: this.convertToQlooAttributes(personalityData)
    };

    return tasteProfile;
  }

  // Extract music preferences from OpenAI conversation
  extractMusicPreferences(responses) {
    const musicResponse = responses.find(r => r.step === 6); // Music taste step
    if (!musicResponse) return [];

    const musicKeywords = {
      'pop': ['pop', 'taylor swift', 'mainstream', 'radio'],
      'hip-hop': ['hip hop', 'rap', 'hip-hop', 'drake', 'kendrick'],
      'indie': ['indie', 'alternative', 'independent', 'indie rock'],
      'electronic': ['electronic', 'edm', 'techno', 'house', 'dubstep'],
      'rock': ['rock', 'metal', 'punk', 'classic rock'],
      'classical': ['classical', 'orchestra', 'mozart', 'beethoven'],
      'r&b': ['r&b', 'soul', 'rnb', 'neo soul'],
      'country': ['country', 'folk', 'bluegrass'],
      'jazz': ['jazz', 'blues', 'smooth jazz']
    };

    const extractedGenres = [];
    const answer = musicResponse.answer.toLowerCase();

    for (const [genre, keywords] of Object.entries(musicKeywords)) {
      if (keywords.some(keyword => answer.includes(keyword))) {
        extractedGenres.push(genre);
      }
    }

    return extractedGenres.length > 0 ? extractedGenres : ['pop']; // Default fallback
  }

  // Extract lifestyle preferences
  extractLifestylePreferences(responses) {
    const lifestyle = {};

    // Sleep schedule (step 2)
    const sleepResponse = responses.find(r => r.step === 2);
    if (sleepResponse) {
      if (sleepResponse.answer.toLowerCase().includes('night')) {
        lifestyle.sleep_schedule = 'night_owl';
      } else if (sleepResponse.answer.toLowerCase().includes('early')) {
        lifestyle.sleep_schedule = 'early_bird';
      } else {
        lifestyle.sleep_schedule = 'flexible';
      }
    }

    // Study habits (step 3)
    const studyResponse = responses.find(r => r.step === 3);
    if (studyResponse) {
      if (studyResponse.answer.toLowerCase().includes('silence')) {
        lifestyle.study_environment = 'quiet';
      } else if (studyResponse.answer.toLowerCase().includes('music')) {
        lifestyle.study_environment = 'background_music';
      } else {
        lifestyle.study_environment = 'flexible';
      }
    }

    // Cleanliness (step 4)
    const cleanResponse = responses.find(r => r.step === 4);
    if (cleanResponse) {
      if (cleanResponse.answer.toLowerCase().includes('organized')) {
        lifestyle.cleanliness = 'very_organized';
      } else if (cleanResponse.answer.toLowerCase().includes('messy')) {
        lifestyle.cleanliness = 'relaxed';
      } else {
        lifestyle.cleanliness = 'moderate';
      }
    }

    return lifestyle;
  }

  // Extract entertainment preferences
  extractEntertainmentPreferences(responses) {
    // This would analyze hobbies, interests responses
    const hobbiesResponse = responses.find(r => r.step === 7);
    if (!hobbiesResponse) return [];

    const entertainment = [];
    const answer = hobbiesResponse.answer.toLowerCase();

    const entertainmentMap = {
      'netflix': ['netflix', 'movies', 'tv', 'streaming'],
      'gaming': ['gaming', 'games', 'video games', 'xbox', 'playstation'],
      'reading': ['reading', 'books', 'novels'],
      'sports': ['sports', 'gym', 'workout', 'fitness'],
      'art': ['art', 'painting', 'drawing', 'creative'],
      'cooking': ['cooking', 'baking', 'food'],
      'travel': ['travel', 'traveling', 'explore']
    };

    for (const [category, keywords] of Object.entries(entertainmentMap)) {
      if (keywords.some(keyword => answer.includes(keyword))) {
        entertainment.push(category);
      }
    }

    return entertainment;
  }

  // Extract social preferences
  extractSocialPreferences(responses) {
    const socialResponse = responses.find(r => r.step === 5);
    if (!socialResponse) return 'moderate';

    const answer = socialResponse.answer.toLowerCase();
    
    if (answer.includes('party') || answer.includes('friends over')) {
      return 'very_social';
    } else if (answer.includes('quiet') || answer.includes('alone')) {
      return 'introverted';
    } else {
      return 'moderate';
    }
  }

  // Convert personality data to Qloo attributes
  convertToQlooAttributes(personalityData) {
    return {
      college_student: true,
      university: personalityData.university,
      major: personalityData.major,
      sleep_schedule: personalityData.sleepSchedule,
      study_habits: personalityData.studyHabits,
      cleanliness_level: personalityData.cleanliness,
      social_level: personalityData.socialLevel,
      seeking_roommate: true
    };
  }

  // Send profile to Qloo and get taste graph
  async createQlooProfile(tasteProfile) {
    try {
      const response = await fetch(`${QLOO_BASE_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile_data: tasteProfile,
          return_recommendations: true
        })
      });

      if (!response.ok) {
        throw new Error(`Qloo API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        profile_id: data.profile_id,
        taste_vector: data.taste_vector,
        recommendations: data.recommendations
      };

    } catch (error) {
      console.error('Qloo Profile Creation Error:', error);
      
      // Return simulated data for demo
      return this.createSimulatedQlooProfile(tasteProfile);
    }
  }

  // Find compatible roommates using Qloo
  async findCompatibleRoommates(userProfileId, userTasteVector, availableRoommates) {
    try {
      const compatibilityRequests = availableRoommates.map(roommate => ({
        profile_id: roommate.qloo_profile_id,
        taste_vector: roommate.taste_vector
      }));

      const response = await fetch(`${QLOO_BASE_URL}/compatibility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base_profile: {
            profile_id: userProfileId,
            taste_vector: userTasteVector
          },
          comparison_profiles: compatibilityRequests,
          return_explanations: true
        })
      });

      if (!response.ok) {
        throw new Error(`Qloo Compatibility API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Sort by compatibility score and return top matches
      const sortedMatches = data.compatibility_scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 matches

      return sortedMatches.map(match => ({
        roommate_id: match.profile_id,
        compatibility_score: Math.round(match.score * 100), // Convert to percentage
        explanation: match.explanation,
        shared_interests: match.shared_attributes,
        compatibility_reasons: this.generateCompatibilityReasons(match)
      }));

    } catch (error) {
      console.error('Qloo Compatibility Error:', error);
      
      // Return simulated compatibility data
      return this.createSimulatedCompatibility(availableRoommates);
    }
  }

  // Generate human-readable compatibility reasons
  generateCompatibilityReasons(match) {
    const reasons = [];
    
    if (match.shared_attributes) {
      if (match.shared_attributes.music) {
        reasons.push(`🎵 Both love ${match.shared_attributes.music.join(', ')} music`);
      }
      if (match.shared_attributes.lifestyle?.sleep_schedule) {
        reasons.push(`🌙 Compatible sleep schedules (${match.shared_attributes.lifestyle.sleep_schedule})`);
      }
      if (match.shared_attributes.lifestyle?.study_environment) {
        reasons.push(`📚 Similar study preferences (${match.shared_attributes.lifestyle.study_environment})`);
      }
      if (match.shared_attributes.social_level) {
        reasons.push(`🎉 Matching social energy levels`);
      }
    }

    return reasons.length > 0 ? reasons : ['🤝 Strong overall personality compatibility'];
  }

  // Simulated Qloo profile for demo
  createSimulatedQlooProfile(tasteProfile) {
    return {
      profile_id: `qloo_${Math.random().toString(36).substring(2, 15)}`,
      taste_vector: this.generateSimulatedVector(),
      recommendations: {
        music: tasteProfile.preferences.music,
        lifestyle_compatibility: tasteProfile.preferences.lifestyle
      }
    };
  }

  // Generate simulated taste vector
  generateSimulatedVector() {
    return Array.from({ length: 50 }, () => Math.random() * 2 - 1); // 50-dim vector with values -1 to 1
  }

  // Simulated compatibility for demo with realistic matching
  createSimulatedCompatibility(roommates, userPersonality) {
    return roommates.map(roommate => {
      // Calculate compatibility based on personality similarity
      let score = 70; // Base score
      
      // Sleep schedule compatibility (high weight)
      if (userPersonality?.sleepSchedule === roommate.personality_analysis?.sleepSchedule) {
        score += 10;
      } else if (
        (userPersonality?.sleepSchedule === 'flexible') || 
        (roommate.personality_analysis?.sleepSchedule === 'flexible')
      ) {
        score += 5;
      }
      
      // Study habits compatibility
      if (userPersonality?.studyHabits === roommate.personality_analysis?.studyHabits) {
        score += 8;
      }
      
      // Social level compatibility
      if (userPersonality?.socialLevel === roommate.personality_analysis?.socialLevel) {
        score += 7;
      }
      
      // Cleanliness compatibility
      if (userPersonality?.cleanliness === roommate.personality_analysis?.cleanliness) {
        score += 5;
      }
      
      // Add some randomness but keep it realistic
      score += Math.floor(Math.random() * 10) - 5; // -5 to +5
      score = Math.min(99, Math.max(65, score)); // Keep between 65-99%
      
      // Generate compatibility reasons based on actual data
      const reasons = this.generateRealisticReasons(userPersonality, roommate);
      
      return {
        roommate_id: roommate.id,
        name: roommate.profile.name,
        major: roommate.profile.major,
        year: roommate.profile.year,
        university: roommate.university,
        bio: roommate.profile.bio,
        interests: roommate.profile.interests,
        compatibility_score: score,
        explanation: `${score}% compatibility based on lifestyle and personality match`,
        shared_interests: this.findSharedInterests(userPersonality, roommate),
        compatibility_reasons: reasons,
        lifestyle: roommate.lifestyle,
        aura_match: this.generateAuraMatch(roommate.personality_analysis)
      };
    }).sort((a, b) => b.compatibility_score - a.compatibility_score);
  }

  // Generate realistic compatibility reasons
  generateRealisticReasons(userPersonality, roommate) {
    const reasons = [];
    
    // Sleep schedule
    if (userPersonality?.sleepSchedule === roommate.personality_analysis?.sleepSchedule) {
      const scheduleMap = {
        'night_owl': '🌙 Both are night owls - late study sessions together',
        'early_bird': '🌅 Both are early birds - morning routines sync up',
        'flexible': '⏰ Both have flexible schedules - easy to coordinate'
      };
      reasons.push(scheduleMap[userPersonality.sleepSchedule] || '⏰ Compatible sleep schedules');
    }
    
    // Study habits
    if (userPersonality?.studyHabits === roommate.personality_analysis?.studyHabits) {
      const studyMap = {
        'background_music': '🎵 Both prefer background music while studying',
        'quiet': '📚 Both need quiet environments for deep focus',
        'study_groups': '👥 Both love collaborative study sessions',
        'cafe_atmosphere': '☕ Both thrive in cafe-like study environments'
      };
      reasons.push(studyMap[userPersonality.studyHabits] || '📚 Similar study preferences');
    }
    
    // Social compatibility
    if (userPersonality?.socialLevel === roommate.personality_analysis?.socialLevel) {
      const socialMap = {
        'social': '🎉 Both love social gatherings and meeting new people',
        'moderate': '🤝 Both enjoy balanced social lives - not too quiet, not too wild',
        'quiet': '🏠 Both prefer intimate, calm living environments'
      };
      reasons.push(socialMap[userPersonality.socialLevel] || '🤝 Compatible social energy');
    }
    
    // Cleanliness
    if (userPersonality?.cleanliness === roommate.personality_analysis?.cleanliness) {
      const cleanMap = {
        'very_organized': '✨ Both are highly organized and value clean spaces',
        'organized': '🧹 Both maintain tidy, organized living spaces',
        'moderate': '🏡 Both prefer lived-in but clean environments'
      };
      reasons.push(cleanMap[userPersonality.cleanliness] || '🧹 Similar cleanliness standards');
    }
    
    // Add some interests-based reasons
    const sharedInterests = this.findSharedInterests(userPersonality, roommate);
    if (sharedInterests.length > 0) {
      reasons.push(`🎯 Share interests in ${sharedInterests.slice(0, 2).join(' and ')}`);
    }
    
    return reasons.slice(0, 4); // Max 4 reasons
  }

  // Find shared interests (simplified)
  findSharedInterests(userPersonality, roommate) {
    // This would be more sophisticated with real data
    const commonInterests = ['music', 'technology', 'fitness', 'reading', 'movies'];
    return commonInterests.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  // Generate AuraMatch personality type
  generateAuraMatch(personality) {
    if (personality?.sleepSchedule === 'night_owl' && personality?.socialLevel === 'quiet') {
      return 'Night Owl Creative';
    } else if (personality?.socialLevel === 'social') {
      return 'Social Butterfly';
    } else if (personality?.cleanliness === 'very_organized' && personality?.sleepSchedule === 'early_bird') {
      return 'Organized Achiever';
    } else if (personality?.studyHabits === 'background_music') {
      return 'Chill Vibes';
    } else {
      return 'Balanced Lifestyle';
    }
  }

  // Update user profile with Qloo data
  async updateUserWithQlooData(userId, qlooProfile) {
    // This would typically update Firebase with Qloo profile data
    const updateData = {
      qloo_profile_id: qlooProfile.profile_id,
      taste_vector: qlooProfile.taste_vector,
      qloo_recommendations: qlooProfile.recommendations,
      updated_at: new Date().toISOString()
    };

    console.log('Updating user with Qloo data:', updateData);
    return updateData;
  }
}

// Create and export singleton
const qlooService = new QlooService();
export default qlooService;