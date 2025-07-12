export class PromptEnhancer {
    baseSystemPrompt = "You are a helpful AI assistant with deep understanding of human psychology and communication patterns.";
    enhancePrompt(originalMessage, intent, context, history = []) {
        const enhancedSystemPrompt = this.buildEnhancedSystemPrompt(intent, context);
        const contextualInstructions = this.generateContextualInstructions(intent, context, history);
        const toneAdjustments = this.generateToneAdjustments(intent, context);
        const responseStrategy = this.determineResponseStrategy(intent, context);
        return {
            enhancedSystemPrompt,
            contextualInstructions,
            toneAdjustments,
            responseStrategy
        };
    }
    buildEnhancedSystemPrompt(intent, context) {
        let prompt = this.baseSystemPrompt;
        // Add human-centric understanding
        prompt += " You excel at reading between the lines and understanding what humans really need, even when they don't express it perfectly.";
        // Add intent-specific guidance
        switch (intent.type) {
            case 'learning':
                prompt += " You are an exceptional teacher who adapts your teaching style to the student's level and learning preferences.";
                break;
            case 'problem_solving':
                prompt += " You are a skilled problem-solver who approaches issues systematically while remaining calm and supportive.";
                break;
            case 'emotional':
                prompt += " You are empathetic and emotionally intelligent, capable of providing comfort and understanding.";
                break;
            case 'creative':
                prompt += " You are a creative collaborator who inspires innovation and helps explore new ideas.";
                break;
            case 'urgent':
                prompt += " You prioritize efficiency and immediate solutions while maintaining accuracy and helpfulness.";
                break;
        }
        // Add emotion-aware guidance
        if (intent.emotion === 'frustrated') {
            prompt += " The user seems frustrated - be extra patient, reassuring, and focus on clear, actionable solutions.";
        }
        else if (intent.emotion === 'confused') {
            prompt += " The user appears confused - break down complex concepts, use simple language, and provide step-by-step guidance.";
        }
        else if (intent.emotion === 'excited') {
            prompt += " The user is enthusiastic - match their energy while channeling it productively.";
        }
        else if (intent.emotion === 'curious') {
            prompt += " The user is curious and eager to learn - provide rich, detailed explanations and encourage exploration.";
        }
        // Add expertise level awareness
        switch (context.userExpertiseLevel) {
            case 'beginner':
                prompt += " The user is a beginner - explain concepts from the ground up, define technical terms, and use analogies.";
                break;
            case 'intermediate':
                prompt += " The user has intermediate knowledge - provide context but don't over-explain basics.";
                break;
            case 'expert':
                prompt += " The user is experienced - engage at a peer level with technical depth and nuanced discussion.";
                break;
        }
        // Add context-specific guidance
        if (intent.context === 'professional') {
            prompt += " This is a professional context - maintain a professional tone while being approachable and practical.";
        }
        else if (intent.context === 'educational') {
            prompt += " This is an educational context - focus on learning outcomes and knowledge building.";
        }
        else if (intent.context === 'personal') {
            prompt += " This is a personal context - be more casual and personable in your approach.";
        }
        return prompt;
    }
    generateContextualInstructions(intent, context, history) {
        const instructions = [];
        // Base instructions from suggested approach
        intent.suggestedApproach.forEach(approach => {
            switch (approach) {
                case 'provide_clear_answer':
                    instructions.push("Provide a direct, clear answer to the question");
                    break;
                case 'use_examples':
                    instructions.push("Include practical examples to illustrate your points");
                    break;
                case 'step_by_step':
                    instructions.push("Break down the response into clear, actionable steps");
                    break;
                case 'empathetic_response':
                    instructions.push("Acknowledge the user's feelings and show understanding");
                    break;
                case 'simplify_explanation':
                    instructions.push("Use simple language and avoid unnecessary jargon");
                    break;
                case 'technical_depth':
                    instructions.push("Provide detailed technical information and advanced concepts");
                    break;
                case 'immediate_action':
                    instructions.push("Focus on providing quick, actionable solutions");
                    break;
                case 'educational_opportunities':
                    instructions.push("Include learning opportunities and deeper exploration");
                    break;
            }
        });
        // Add conversation flow awareness
        switch (context.conversationFlow) {
            case 'introduction':
                instructions.push("This appears to be the start of a conversation - be welcoming and set a positive tone");
                break;
            case 'deep_dive':
                instructions.push("The user is engaged in detailed exploration - provide comprehensive information");
                break;
            case 'problem_solving':
                instructions.push("Focus on systematic problem resolution and verification");
                break;
            case 'wrap_up':
                instructions.push("Summarize key points and offer follow-up opportunities");
                break;
        }
        // Add history-aware instructions
        if (history.length > 0) {
            const lastMessage = history[history.length - 1];
            if (lastMessage.role === 'assistant') {
                instructions.push("Reference previous discussion points where relevant to maintain continuity");
            }
        }
        // Add urgency-specific instructions
        if (intent.urgency === 'high') {
            instructions.push("Prioritize the most critical information first");
            instructions.push("Provide quick wins or immediate next steps");
        }
        else if (intent.urgency === 'low') {
            instructions.push("Take time to provide comprehensive coverage of the topic");
            instructions.push("Include additional context and background information");
        }
        return instructions;
    }
    generateToneAdjustments(intent, context) {
        const adjustments = [];
        // Base tone from emotion
        switch (intent.emotion) {
            case 'frustrated':
                adjustments.push("Use a calm, patient tone");
                adjustments.push("Avoid phrases that might increase frustration");
                adjustments.push("Focus on solutions rather than problems");
                break;
            case 'excited':
                adjustments.push("Match the user's enthusiasm appropriately");
                adjustments.push("Use positive, energetic language");
                break;
            case 'confused':
                adjustments.push("Be extra clear and reassuring");
                adjustments.push("Use gentle, non-condescending language");
                break;
            case 'curious':
                adjustments.push("Encourage exploration and questions");
                adjustments.push("Use engaging, informative tone");
                break;
            case 'grateful':
                adjustments.push("Acknowledge their appreciation warmly");
                adjustments.push("Maintain helpful, supportive tone");
                break;
            default:
                adjustments.push("Maintain a friendly, professional tone");
        }
        // Adjust for expertise level
        switch (context.userExpertiseLevel) {
            case 'beginner':
                adjustments.push("Use encouraging, supportive language");
                adjustments.push("Avoid intimidating technical language");
                break;
            case 'expert':
                adjustments.push("Use peer-to-peer professional tone");
                adjustments.push("Feel free to use appropriate technical terminology");
                break;
        }
        // Adjust for context
        if (intent.context === 'professional') {
            adjustments.push("Maintain professional courtesy");
            adjustments.push("Be direct but respectful");
        }
        else if (intent.context === 'personal') {
            adjustments.push("Be more conversational and relaxed");
            adjustments.push("Show personal interest and warmth");
        }
        // Adjust for complexity
        if (intent.complexity === 'complex') {
            adjustments.push("Be patient with complex explanations");
            adjustments.push("Acknowledge the complexity of the topic");
        }
        else if (intent.complexity === 'simple') {
            adjustments.push("Keep responses concise and to the point");
            adjustments.push("Avoid over-complicating simple concepts");
        }
        return adjustments;
    }
    determineResponseStrategy(intent, context) {
        let strategy = "";
        // Primary strategy based on intent type
        switch (intent.type) {
            case 'question':
                strategy = "Direct Answer Strategy: Provide clear, accurate information with supporting details";
                break;
            case 'request':
                strategy = "Action-Oriented Strategy: Focus on practical steps and implementation";
                break;
            case 'learning':
                strategy = "Educational Strategy: Build understanding progressively with examples and context";
                break;
            case 'problem_solving':
                strategy = "Systematic Problem-Solving Strategy: Analyze, diagnose, and provide structured solutions";
                break;
            case 'creative':
                strategy = "Collaborative Creative Strategy: Brainstorm ideas and explore possibilities together";
                break;
            case 'emotional':
                strategy = "Empathetic Support Strategy: Acknowledge emotions and provide appropriate support";
                break;
            case 'urgent':
                strategy = "Rapid Response Strategy: Prioritize immediate, actionable solutions";
                break;
            case 'casual':
                strategy = "Conversational Strategy: Engage naturally while being helpful";
                break;
        }
        // Add modifiers based on context
        if (intent.urgency === 'high') {
            strategy += " with emphasis on speed and immediate applicability";
        }
        if (intent.complexity === 'complex') {
            strategy += " with careful attention to detail and comprehensive coverage";
        }
        if (context.userMood === 'negative') {
            strategy += " while being extra supportive and positive";
        }
        return strategy;
    }
    // Helper method to combine everything into a final system prompt
    generateFinalSystemPrompt(enhancedPrompt) {
        let finalPrompt = enhancedPrompt.enhancedSystemPrompt;
        if (enhancedPrompt.contextualInstructions.length > 0) {
            finalPrompt += "\\n\\nSpecific Instructions:\\n";
            enhancedPrompt.contextualInstructions.forEach((instruction, index) => {
                finalPrompt += `${index + 1}. ${instruction}\\n`;
            });
        }
        if (enhancedPrompt.toneAdjustments.length > 0) {
            finalPrompt += "\\nTone Guidelines:\\n";
            enhancedPrompt.toneAdjustments.forEach((adjustment, index) => {
                finalPrompt += `- ${adjustment}\\n`;
            });
        }
        finalPrompt += `\\nResponse Strategy: ${enhancedPrompt.responseStrategy}`;
        return finalPrompt;
    }
}
//# sourceMappingURL=PromptEnhancer.js.map