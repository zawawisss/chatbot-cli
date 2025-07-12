import { Message } from '../providers/types.js';

export interface HumanIntent {
  type: 'question' | 'request' | 'emotional' | 'creative' | 'problem_solving' | 'learning' | 'urgent' | 'casual';
  confidence: number;
  emotion?: 'frustrated' | 'excited' | 'confused' | 'urgent' | 'curious' | 'grateful' | 'neutral';
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
  context?: string;
  suggestedApproach: string[];
}

export interface ConversationContext {
  userMood: 'positive' | 'negative' | 'neutral' | 'mixed';
  conversationFlow: 'introduction' | 'deep_dive' | 'problem_solving' | 'wrap_up';
  userExpertiseLevel: 'beginner' | 'intermediate' | 'expert' | 'unknown';
  topicContinuity: boolean;
  previousSatisfaction: 'satisfied' | 'unsatisfied' | 'neutral';
}

export class HumanIntentAnalyzer {
  private conversationHistory: Message[] = [];
  private currentContext: ConversationContext = {
    userMood: 'neutral',
    conversationFlow: 'introduction',
    userExpertiseLevel: 'unknown',
    topicContinuity: false,
    previousSatisfaction: 'neutral'
  };

  // Emotional indicators in different languages
  private emotionalPatterns = {
    frustrated: [
      /tidak bisa/i, /gagal/i, /error/i, /masalah/i, /susah/i, /sulit/i,
      /can't/i, /failed/i, /broken/i, /issue/i, /problem/i, /difficult/i,
      /помочь/i, /проблема/i, /ошибка/i
    ],
    excited: [
      /amazing/i, /awesome/i, /fantastic/i, /keren/i, /bagus sekali/i, /luar biasa/i,
      /wow/i, /incredible/i, /perfect/i, /excellent/i
    ],
    confused: [
      /bingung/i, /tidak mengerti/i, /tidak paham/i, /gimana/i, /bagaimana/i,
      /confused/i, /don't understand/i, /how/i, /what/i, /unclear/i
    ],
    urgent: [
      /cepat/i, /segera/i, /urgent/i, /asap/i, /penting/i, /butuh sekarang/i,
      /quickly/i, /immediately/i, /urgent/i, /emergency/i, /rush/i
    ],
    curious: [
      /penasaran/i, /ingin tahu/i, /interesting/i, /curious/i, /tell me more/i,
      /how does/i, /why/i, /what if/i, /explore/i
    ],
    grateful: [
      /terima kasih/i, /makasih/i, /thanks/i, /thank you/i, /appreciate/i,
      /helpful/i, /great/i, /спасибо/i
    ]
  };

  // Complexity indicators
  private complexityPatterns = {
    simple: [
      /apa itu/i, /what is/i, /how to/i, /cara/i, /simple/i, /basic/i,
      /sederhana/i, /dasar/i
    ],
    complex: [
      /implement/i, /architecture/i, /optimize/i, /performance/i, /scale/i,
      /advanced/i, /complex/i, /enterprise/i, /production/i, /sistem kompleks/i,
      /arsitektur/i, /optimasi/i, /lanjutan/i
    ]
  };

  // Urgency indicators
  private urgencyPatterns = {
    high: [
      /urgent/i, /asap/i, /emergency/i, /critical/i, /deadline/i, /penting sekali/i,
      /segera/i, /darurat/i, /kritis/i
    ],
    medium: [
      /soon/i, /today/i, /this week/i, /penting/i, /perlu/i, /minggu ini/i,
      /hari ini/i
    ]
  };

  // Learning indicators
  private learningPatterns = [
    /learn/i, /understand/i, /explain/i, /teach me/i, /tutorial/i,
    /belajar/i, /mengerti/i, /jelaskan/i, /ajarkan/i, /panduan/i,
    /how does/i, /why/i, /what's the difference/i
  ];

  // Professional context indicators
  private professionalPatterns = [
    /project/i, /work/i, /business/i, /client/i, /meeting/i, /deadline/i,
    /proyek/i, /kerja/i, /bisnis/i, /klien/i, /rapat/i, /tenggat/i,
    /production/i, /enterprise/i, /scale/i
  ];

  analyzeIntent(message: string, history: Message[] = []): HumanIntent {
    this.conversationHistory = history;
    
    const intent = this.detectIntentType(message);
    const emotion = this.detectEmotion(message);
    const complexity = this.detectComplexity(message);
    const urgency = this.detectUrgency(message);
    const context = this.analyzeContext(message);
    
    this.updateConversationContext(message, emotion, intent.type);
    
    return {
      type: intent.type,
      confidence: intent.confidence,
      emotion,
      complexity,
      urgency,
      context,
      suggestedApproach: this.generateApproachSuggestions(intent.type, emotion, complexity, urgency)
    };
  }

  private detectIntentType(message: string): { type: HumanIntent['type'], confidence: number } {
    const lowerMessage = message.toLowerCase();
    
    // Question patterns
    if (/^(apa|what|how|why|when|where|bagaimana|mengapa|kapan|dimana|\?)/i.test(message)) {
      return { type: 'question', confidence: 0.9 };
    }
    
    // Request patterns
    if (/^(tolong|please|can you|could you|bisakah|bisa|help|bantu)/i.test(message)) {
      return { type: 'request', confidence: 0.8 };
    }
    
    // Learning patterns
    if (this.learningPatterns.some(pattern => pattern.test(lowerMessage))) {
      return { type: 'learning', confidence: 0.85 };
    }
    
    // Problem solving patterns
    if (/problem|issue|error|bug|fix|solve|masalah|perbaiki|selesaikan/i.test(lowerMessage)) {
      return { type: 'problem_solving', confidence: 0.8 };
    }
    
    // Creative patterns
    if (/create|design|build|make|generate|buat|rancang|kreatif/i.test(lowerMessage)) {
      return { type: 'creative', confidence: 0.7 };
    }
    
    // Emotional patterns
    if (Object.values(this.emotionalPatterns).flat().some(pattern => pattern.test(lowerMessage))) {
      return { type: 'emotional', confidence: 0.6 };
    }
    
    // Casual patterns
    if (/hi|hello|hai|halo|thanks|terima kasih|bye|selamat/i.test(lowerMessage)) {
      return { type: 'casual', confidence: 0.9 };
    }
    
    return { type: 'question', confidence: 0.5 };
  }

  private detectEmotion(message: string): HumanIntent['emotion'] {
    const lowerMessage = message.toLowerCase();
    
    for (const [emotion, patterns] of Object.entries(this.emotionalPatterns)) {
      if (patterns.some(pattern => pattern.test(lowerMessage))) {
        return emotion as HumanIntent['emotion'];
      }
    }
    
    return 'neutral';
  }

  private detectComplexity(message: string): HumanIntent['complexity'] {
    const lowerMessage = message.toLowerCase();
    
    if (this.complexityPatterns.complex.some(pattern => pattern.test(lowerMessage))) {
      return 'complex';
    }
    
    if (this.complexityPatterns.simple.some(pattern => pattern.test(lowerMessage))) {
      return 'simple';
    }
    
    // Analyze message length and technical terms
    const technicalTerms = /API|database|server|framework|algorithm|optimization|deployment/i;
    const wordCount = message.split(' ').length;
    
    if (wordCount > 20 || technicalTerms.test(message)) {
      return 'complex';
    } else if (wordCount < 10) {
      return 'simple';
    }
    
    return 'medium';
  }

  private detectUrgency(message: string): HumanIntent['urgency'] {
    const lowerMessage = message.toLowerCase();
    
    if (this.urgencyPatterns.high.some(pattern => pattern.test(lowerMessage))) {
      return 'high';
    }
    
    if (this.urgencyPatterns.medium.some(pattern => pattern.test(lowerMessage))) {
      return 'medium';
    }
    
    // Check for time indicators
    if (/now|immediately|today|sekarang|hari ini/i.test(lowerMessage)) {
      return 'high';
    }
    
    return 'low';
  }

  private analyzeContext(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (this.professionalPatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'professional';
    }
    
    if (/personal|hobby|fun|learning|belajar|pribadi/i.test(lowerMessage)) {
      return 'personal';
    }
    
    if (/school|university|study|homework|tugas|kuliah/i.test(lowerMessage)) {
      return 'educational';
    }
    
    return 'general';
  }

  private updateConversationContext(message: string, emotion: HumanIntent['emotion'], intent: HumanIntent['type']): void {
    // Update user mood based on emotion
    if (emotion === 'frustrated' || emotion === 'confused') {
      this.currentContext.userMood = 'negative';
    } else if (emotion === 'excited' || emotion === 'grateful') {
      this.currentContext.userMood = 'positive';
    }
    
    // Update conversation flow
    if (intent === 'casual' && this.conversationHistory.length === 0) {
      this.currentContext.conversationFlow = 'introduction';
    } else if (intent === 'problem_solving' || intent === 'learning') {
      this.currentContext.conversationFlow = 'deep_dive';
    }
    
    // Detect expertise level from language complexity
    const technicalTerms = /API|database|server|framework|algorithm|class|function|variable/i;
    if (technicalTerms.test(message)) {
      this.currentContext.userExpertiseLevel = 'intermediate';
      if (/architecture|optimization|scalability|performance|design patterns/i.test(message)) {
        this.currentContext.userExpertiseLevel = 'expert';
      }
    } else if (/basic|simple|beginner|new to|dasar|pemula|baru/i.test(message)) {
      this.currentContext.userExpertiseLevel = 'beginner';
    }
  }

  private generateApproachSuggestions(
    type: HumanIntent['type'], 
    emotion: HumanIntent['emotion'], 
    complexity: HumanIntent['complexity'], 
    urgency: HumanIntent['urgency']
  ): string[] {
    const suggestions: string[] = [];
    
    // Base approach based on intent type
    switch (type) {
      case 'question':
        suggestions.push('provide_clear_answer', 'use_examples');
        break;
      case 'request':
        suggestions.push('action_oriented', 'step_by_step');
        break;
      case 'learning':
        suggestions.push('educational_tone', 'provide_context', 'offer_resources');
        break;
      case 'problem_solving':
        suggestions.push('systematic_approach', 'troubleshooting_steps');
        break;
      case 'creative':
        suggestions.push('brainstorming', 'multiple_options', 'inspiring_tone');
        break;
      case 'emotional':
        suggestions.push('empathetic_response', 'supportive_tone');
        break;
    }
    
    // Adjust based on emotion
    if (emotion === 'frustrated') {
      suggestions.push('calm_tone', 'reassuring', 'focus_on_solution');
    } else if (emotion === 'excited') {
      suggestions.push('enthusiastic_response', 'build_on_excitement');
    } else if (emotion === 'confused') {
      suggestions.push('simplify_explanation', 'use_analogies', 'break_down_steps');
    } else if (emotion === 'urgent') {
      suggestions.push('direct_response', 'prioritize_immediate_help');
    }
    
    // Adjust based on complexity
    if (complexity === 'simple') {
      suggestions.push('concise_response', 'avoid_jargon');
    } else if (complexity === 'complex') {
      suggestions.push('detailed_explanation', 'technical_accuracy', 'comprehensive_coverage');
    }
    
    // Adjust based on urgency
    if (urgency === 'high') {
      suggestions.push('immediate_action', 'prioritize_quick_solution');
    } else if (urgency === 'low') {
      suggestions.push('thorough_exploration', 'educational_opportunities');
    }
    
    // Consider user expertise level
    if (this.currentContext.userExpertiseLevel === 'beginner') {
      suggestions.push('explain_basics', 'define_terms', 'gentle_guidance');
    } else if (this.currentContext.userExpertiseLevel === 'expert') {
      suggestions.push('technical_depth', 'advanced_concepts', 'peer_level_discussion');
    }
    
    return [...new Set(suggestions)]; // Remove duplicates
  }

  getConversationContext(): ConversationContext {
    return { ...this.currentContext };
  }

  updateConversationFlow(flow: ConversationContext['conversationFlow']): void {
    this.currentContext.conversationFlow = flow;
  }

  markSatisfaction(satisfaction: ConversationContext['previousSatisfaction']): void {
    this.currentContext.previousSatisfaction = satisfaction;
  }
}
