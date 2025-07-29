// openai.js - OpenAI service for personality assessment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Add to your .env file
const API_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIService {
  constructor() {
    this.conversationHistory = [];
    this.userProfile = {
      name: '',
      major: '',
      year: '',
      responses: []
    };
  }

  // Initialize conversation with system prompt
  initializeConversation() {
    this.conversationHistory = [
      {
        role: 'system',
        content: `You are Vybr's AI roommate matching assistant. Your job is to assess college students' personalities through casual, friendly conversation to find compatible roommates.

PERSONALITY ASSESSMENT AREAS:
1. Name and academic info (major, year)
2. Sleep schedule preferences
3. Study habits and environment needs
4. Cleanliness and organization style
5. Social preferences and energy levels
6. Music taste and entertainment preferences
7. Hobbies and interests

CONVERSATION STYLE:
- Be friendly, casual, and encouraging
- Ask ONE question at a time
- Keep responses short (1-2 sentences max)
- Use emojis naturally
- Make it feel like texting a friend
- Don't be overly formal or robotic

PROGRESSION:
- Start with basic info (name, major)
- Move through each area naturally
- Ask follow-up questions based on their answers
- End by saying you're ready to find their matches

Remember: You're helping college students find compatible roommates, so focus on lifestyle compatibility, not deep psychology.`
      }
    ];
  }

  // Send message to OpenAI and get response
  async sendMessage(userMessage, currentStep = 1) {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Add context about current step
      const stepContext = this.getStepContext(currentStep);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4', // or 'gpt-3.5-turbo' for cheaper option
          messages: [
            ...this.conversationHistory,
            {
              role: 'system',
              content: stepContext
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
          presence_penalty: 0.3,
          frequency_penalty: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content.trim();

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage
      });

      // Extract personality insights
      this.extractPersonalityData(userMessage, currentStep);

      return {
        message: aiMessage,
        nextStep: this.determineNextStep(currentStep, userMessage),
        insights: this.getPersonalityInsights()
      };

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback response if API fails
      return {
        message: "Sorry, I'm having trouble connecting right now. Can you try again?",
        nextStep: currentStep,
        insights: null
      };
    }
  }

  // Get context for current conversation step
  getStepContext(step) {
    const contexts = {
      1: "The user just started. Ask for their name and what they're studying. Be welcoming and excited!",
      2: "Now ask about their sleep schedule. When do they usually go to bed? Are they a night owl or early bird?",
      3: "Ask about their study preferences. Do they need complete silence, background music, or can they handle some noise?",
      4: "Time to ask about cleanliness and organization. Are they neat, messy, or somewhere in between?",
      5: "Ask about their social preferences. Do they like having friends over, parties, or prefer quiet spaces?",
      6: "Ask about music taste and entertainment preferences. What do they listen to?",
      7: "Ask about hobbies and interests. What do they do for fun?",
      8: "Wrap up the conversation. Say you have enough info to find great matches and you're excited to help!"
    };
    
    return contexts[step] || "Continue the natural conversation and move toward wrapping up.";
  }

  // Extract personality data from user responses
  extractPersonalityData(message, step) {
    const lowercaseMessage = message.toLowerCase();
    
    switch (step) {
      case 1: // Name and major
        if (lowercaseMessage.includes('studying') || lowercaseMessage.includes('major')) {
          this.userProfile.major = this.extractMajor(message);
        }
        break;
      
      case 2: // Sleep schedule
        if (lowercaseMessage.includes('night') || lowercaseMessage.includes('late')) {
          this.userProfile.sleepSchedule = 'night_owl';
        } else if (lowercaseMessage.includes('early') || lowercaseMessage.includes('morning')) {
          this.userProfile.sleepSchedule = 'early_bird';
        } else {
          this.userProfile.sleepSchedule = 'flexible';
        }
        break;
      
      case 3: // Study habits
        if (lowercaseMessage.includes('silence') || lowercaseMessage.includes('quiet')) {
          this.userProfile.studyHabits = 'quiet';
        } else if (lowercaseMessage.includes('music') || lowercaseMessage.includes('background')) {
          this.userProfile.studyHabits = 'background_music';
        } else {
          this.userProfile.studyHabits = 'flexible';
        }
        break;
      
      case 4: // Cleanliness
        if (lowercaseMessage.includes('organized') || lowercaseMessage.includes('clean') || lowercaseMessage.includes('neat')) {
          this.userProfile.cleanliness = 'organized';
        } else if (lowercaseMessage.includes('messy') || lowercaseMessage.includes('chaotic')) {
          this.userProfile.cleanliness = 'messy';
        } else {
          this.userProfile.cleanliness = 'moderate';
        }
        break;
      
      case 5: // Social level
        if (lowercaseMessage.includes('party') || lowercaseMessage.includes('friends over') || lowercaseMessage.includes('social')) {
          this.userProfile.socialLevel = 'social';
        } else if (lowercaseMessage.includes('quiet') || lowercaseMessage.includes('alone')) {
          this.userProfile.socialLevel = 'quiet';
        } else {
          this.userProfile.socialLevel = 'moderate';
        }
        break;
    }
    
    // Store raw response for later analysis
    this.userProfile.responses.push({
      step: step,
      question: this.getStepContext(step),
      answer: message
    });
  }

  // Extract major from user message
  extractMajor(message) {
    const majors = [
      'computer science', 'cs', 'engineering', 'business', 'psychology', 
      'biology', 'chemistry', 'physics', 'english', 'history', 'math',
      'economics', 'political science', 'art', 'music', 'theater'
    ];
    
    const lowercaseMessage = message.toLowerCase();
    for (const major of majors) {
      if (lowercaseMessage.includes(major)) {
        return major;
      }
    }
    return 'other';
  }

  // Determine next conversation step
  determineNextStep(currentStep, userMessage) {
    // Simple progression - move to next step
    if (currentStep >= 7) {
      return 'complete';
    }
    return currentStep + 1;
  }

  // Get personality insights for matching
  getPersonalityInsights() {
    return {
      profile: this.userProfile,
      compatibility: {
        sleepSchedule: this.userProfile.sleepSchedule,
        studyHabits: this.userProfile.studyHabits,
        cleanliness: this.userProfile.cleanliness,
        socialLevel: this.userProfile.socialLevel
      },
      conversationData: this.conversationHistory
    };
  }

  // Generate quick reply suggestions based on current step
  getQuickReplies(step) {
    const quickReplies = {
      2: ['Early bird (before 10pm)', 'Night owl (after midnight)', 'Flexible schedule'],
      3: ['Complete silence', 'Background music', 'Study groups'],
      4: ['Very organized', 'Somewhat messy', 'Lived-in feel'],
      5: ['Love having friends over', 'Small gatherings', 'Quiet nights in'],
      6: ['Pop', 'Hip-hop', 'Indie', 'Everything'],
      7: ['Sports', 'Reading', 'Gaming', 'Music']
    };
    
    return quickReplies[step] || [];
  }

  // Reset conversation for new user
  reset() {
    this.conversationHistory = [];
    this.userProfile = {
      name: '',
      major: '',
      year: '',
      responses: []
    };
    this.initializeConversation();
  }
}

// Create singleton instance
const openAIService = new OpenAIService();

export default openAIService;

// Export individual functions for easier use
export const {
  sendMessage,
  getQuickReplies,
  getPersonalityInsights,
  initializeConversation,
  reset
} = openAIService;