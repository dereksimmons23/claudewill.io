// Kabir Basketball Training App - Simplified Neurodivergent-Friendly JavaScript

// ==================== CONSTANTS & CONFIGURATION ====================
// Training data structure
let trainingData = {
    rightHand: 0,
    leftHand: 0,
    threePointers: 0,
    freeThrows: 0,
    trainingTime: 0,
    sessionsCompleted: 0,
    lastSessionDate: null,
    memories: [],
    sessions: []
};

// ==================== GOOGLE ANALYTICS INTEGRATION ====================
function trackEvent(eventName, category, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
}

// ==================== APP INITIALIZATION ====================
function startApp() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadData();
    trackEvent('app_start', 'authentication', 'welcome_screen');
}

function resetApp() {
    if (confirm('Are you sure you want to reset all your training data? This cannot be undone.')) {
        localStorage.removeItem('kabir-training-data');
        localStorage.removeItem('kabir-memories');
        trackEvent('app_reset', 'system', 'user_initiated');
        location.reload();
    }
}

// ==================== TAB NAVIGATION ====================
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
}

function switchTab(tabName) {
    try {
        // Remove active class and aria-selected from all tabs
        document.querySelectorAll('.tab-btn').forEach(tab => {
            if (tab && tab.classList) {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });
        
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content && content.classList) {
                content.classList.remove('active');
            }
        });

        // Show selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(tabName);
        
        if (selectedTab && selectedTab.classList) {
            selectedTab.classList.add('active');
            selectedTab.setAttribute('aria-selected', 'true');
        }
        if (selectedContent && selectedContent.classList) {
            selectedContent.classList.add('active');
        }

        trackEvent('tab_switch', 'navigation', tabName);
    } catch (error) {
        console.log('Tab switch error:', error);
    }
}

// ==================== SIMPLIFIED SCORE TRACKING ====================
function updateScore(type, change) {
    const newValue = Math.max(0, trainingData[type] + change);
    
    // Set maximum values for each type
    const maxValues = {
        rightHand: 50,
        leftHand: 50,
        threePointers: 30,
        freeThrows: 30,
        trainingTime: 180
    };
    
    trainingData[type] = Math.min(newValue, maxValues[type] || 999);
    
    updateDisplay(type);
    saveData();
    
    trackEvent('score_update', 'training', type, trainingData[type]);
}

function updateDisplay(type) {
    const display = document.getElementById(type + 'Display');
    if (display) {
        display.textContent = trainingData[type];
        // Add a subtle animation for feedback
        display.style.transform = 'scale(1.1)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 200);
    }
    
    updateProgressBars();
}

function updateProgressBars() {
    const goals = {
        rightHand: 50,
        leftHand: 45,
        threePointers: 20,
        freeThrows: 20
    };

    Object.keys(goals).forEach(type => {
        const current = trainingData[type];
        const goal = goals[type];
        const percentage = Math.min((current / goal) * 100, 100);
        
        const progressBar = document.getElementById(type + 'Progress');
        const goalText = document.getElementById(type + 'Goal');
        
        if (progressBar) progressBar.style.width = percentage + '%';
        if (goalText) goalText.textContent = `${current}/${goal}`;
    });
}

function completeSession() {
    const today = new Date().toDateString();
    trainingData.sessionsCompleted++;
    trainingData.lastSessionDate = today;
    
    // Create session record
    const session = {
        date: today,
        rightHand: trainingData.rightHand,
        leftHand: trainingData.leftHand,
        threePointers: trainingData.threePointers,
        freeThrows: trainingData.freeThrows,
        trainingTime: trainingData.trainingTime,
        timestamp: Date.now()
    };
    
    trainingData.sessions.push(session);
    
    saveData();
    updateSessionStats();
    
    trackEvent('session_complete', 'training', 'completed', trainingData.sessionsCompleted);
    
    // Motivational message
    const messages = [
        'Great session, Kabir! 🏀 Your inner voice is your champion of success!',
        'Excellent work! 💪 Champions are made when no one is watching!',
        'Amazing effort! 🔥 Next shot goes in. Always!',
        'Outstanding session! ⭐ You\'re building something special!',
        'Fantastic work! 🚀 Keep getting those reps in!'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
}

function updateSessionStats() {
    const streakElement = document.getElementById('trainingStreak');
    const sessionsElement = document.getElementById('totalSessions');
    
    if (streakElement) streakElement.textContent = calculateStreak();
    if (sessionsElement) sessionsElement.textContent = trainingData.sessionsCompleted;
}

function calculateStreak() {
    const today = new Date().toDateString();
    return trainingData.lastSessionDate === today ? trainingData.sessionsCompleted : 1;
}

// ==================== ENHANCED COACH D AI SYSTEM ====================
async function askQuickQuestion(questionType) {
    const responses = {
        leftHand: "Kabir, remember - Chris Paul was equally good with both hands. That's you! Focus on the one-leg shooting in Get 50 for balance. Keep that wide base, spin low and quick. Your left hand is getting stronger every day. Next shot goes in. Always.",
        
        shooting: "High and soft, Kabir. Three basketballs fit through the rim when you shoot with proper arc. Don't let the rim be an extra defender. Aim small, miss small. Hold your finish and pose for the camera. You got this!",
        
        spinMove: "Protect that ball like a running back, Kabir! Multiple points of contact when you spin. Spin low, fast, and use their leverage against them. Don't let anyone pop it loose. Wide base, stay strong through contact.",
        
        mentalGame: "Your inner voice is your champion of success. You're not training alone - you're training in front of a packed arena. See the crowd, the teammates. Expect greatness from yourself. Champions are made when no one is watching.",
        
        fatigue: "Do you think the Top 10 incoming freshmen get tired? Push through, Kabir. This is where mental toughness is built. Energy flows from your voice - be loud, stay moving. Impossible to stand still and be loud.",
        
        motivation: "You're already SO much better than when we started in May! Every rep counts. Half the battle is turning awkward into a new normal. Keep getting those reps in. Neuroplasticity is building new pathways every day.",
        
        // Enhanced neurodivergent support responses
        organization: "Kabir, that's exactly why we built this app for you! Your brain works differently, and that's your superpower in basketball. Follow the same routine every session: Get 50 first, then conditioning, then free throws. Same order, every time. Champions love routine - it frees your mind to focus on getting better instead of remembering what's next.",
        
        overwhelmed: "Take a breath, Kabir. You're not behind, you're building. When your brain feels full, that means you're learning! Focus on just ONE drill at a time. Complete it, celebrate it, move to the next. The app keeps track so you don't have to. Your inner voice is your champion of success.",
        
        focus: "Kabir, your brain needs variety to stay engaged - that's not a weakness, it's how you're wired! Break your 60 minutes into 4 chunks: 15 minutes Get 50, 15 minutes conditioning, 15 minutes free throws, 15 minutes creative shooting. Move between different challenges. Your attention will stay sharp and your skills will improve faster.",
        
        distracted: "Perfect! That's your creative brain working, Kabir. But when you shoot, give that ball 100% attention for just 3 seconds: see the target, feel the form, follow through. Then your mind can wander until the next shot. Quality focus for 3 seconds beats scattered attention for 30 minutes. Aim small, miss small.",
        
        alone: "Kabir, you're not training alone - you're training in your own private gym where you can focus without distractions! Your brain actually loves this because you control the environment, the pace, the routine. Plus, solo training is where superstars are made. Every shot you take alone makes you more confident when you're with the team.",
        
        confidence: "Bad shooting days teach you more than perfect ones, Kabir! Your brain is wired to notice patterns and details - use that to figure out what felt different. Were you rushing? Tired? Different location? Champions have goldfish memory for bad shots - 10 seconds, then back to work. Next shot goes in. Always.",
        
        pressure: "Pressure is just information, Kabir. Your brain is processing everything at once - teammates, opponents, crowd, score. That's a lot! Focus on one thing: the rim. Your practice shots went in thousands of times. This shot is just another rep with people watching. Your inner voice is your champion of success.",
        
        routine: "Consistency is king, Kabir! Your brain thrives on routine, and that's exactly what builds basketball excellence. Same time, same warm-up, same progression. This isn't rigid - this is professional. Elite players have routines they follow religiously. Your brain's love for structure is your competitive advantage."
    };

    const response = responses[questionType] || "Keep working hard, Kabir! Every challenge is an opportunity to grow.";
    
    displayCoachResponse(response);
    
    trackEvent('coach_quick_question', 'coaching', questionType);
}

async function askCustomQuestion() {
    const question = document.getElementById('customQuestion').value.trim();
    
    if (!question) {
        alert('Please enter a question first!');
        return;
    }

    try {
        // Using window.claude.complete for authentic Coach D responses
        if (window.claude && window.claude.complete) {
            const prompt = `
            You are Coach Derek Simmons responding to your basketball player Kabir Patel, an 8th grader preparing for high school tryouts. 

            Kabir's context:
            - Working on Get 50 shooting drills (current: ${trainingData.rightHand} right, ${trainingData.leftHand} left)
            - Training solo in India for a month
            - Goals: 50/50 right hand, 45/50 left hand, 20 3-pointers in 2 min, 20 free throws in 1 min
            - Key focus areas: Left hand development, decision-making, spin moves, mental toughness
            - Has ADHD and ASD - needs clear, structured, encouraging guidance

            Kabir asks: "${question}"

            Respond as Coach D with:
            - Encouraging but specific guidance
            - Reference to his current progress when relevant
            - Your authentic coaching terminology
            - 2-3 sentences maximum
            - End with motivation

            Core mantras to reference when appropriate:
            - "Your inner voice is your champion of success"
            - "Next shot goes in. Always."
            - "Aim small, miss small"
            - "High and soft. Three basketballs fit"
            `;

            const response = await window.claude.complete(prompt);
            displayCoachResponse(response);
        } else {
            // Enhanced fallback responses based on question keywords
            let response = getFallbackResponse(question);
            displayCoachResponse(response);
        }
    } catch (error) {
        console.log('AI response error:', error);
        const fallbackResponse = getFallbackResponse(question);
        displayCoachResponse(fallbackResponse);
    }

    document.getElementById('customQuestion').value = '';
    
    trackEvent('coach_custom_question', 'coaching', 'custom_ai_query');
}

function getFallbackResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Neurodivergent support responses
    if (lowerQuestion.includes('organization') || lowerQuestion.includes('organize') || lowerQuestion.includes('forget')) {
        return "Kabir, that's exactly why we built this app for you! Your brain works differently, and that's your superpower in basketball. Follow the same routine every session. The app keeps track so you don't have to. Champions love routine - it frees your mind to focus on getting better.";
    } else if (lowerQuestion.includes('overwhelmed') || lowerQuestion.includes('too much') || lowerQuestion.includes('stressed')) {
        return "Take a breath, Kabir. You're not behind, you're building. When your brain feels full, that means you're learning! Focus on just ONE drill at a time. Complete it, celebrate it, move to the next. Your inner voice is your champion of success.";
    } else if (lowerQuestion.includes('focus') || lowerQuestion.includes('distracted') || lowerQuestion.includes('attention')) {
        return "Kabir, your brain needs variety to stay engaged - that's not a weakness, it's how you're wired! Break your training into chunks and move between different challenges. Quality focus for short periods beats scattered attention for long periods.";
    } else if (lowerQuestion.includes('alone') || lowerQuestion.includes('lonely') || lowerQuestion.includes('by myself')) {
        return "Kabir, you're not training alone - you're training in your own private gym where you can focus without distractions! Your brain actually loves this because you control the environment, the pace, the routine. Solo training is where superstars are made.";
    } else if (lowerQuestion.includes('confidence') || lowerQuestion.includes('doubt') || lowerQuestion.includes('bad day')) {
        return "Bad shooting days teach you more than perfect ones, Kabir! Your brain is wired to notice patterns - use that to figure out what felt different. Champions have goldfish memory for bad shots - 10 seconds, then back to work. Next shot goes in. Always.";
    } else if (lowerQuestion.includes('pressure') || lowerQuestion.includes('nervous') || lowerQuestion.includes('game')) {
        return "Pressure is just information, Kabir. Your brain is processing everything at once. Focus on one thing: the rim. Your practice shots went in thousands of times. This shot is just another rep with people watching. Your inner voice is your champion of success.";
    } else if (lowerQuestion.includes('routine') || lowerQuestion.includes('schedule') || lowerQuestion.includes('when')) {
        return "Consistency is king, Kabir! Your brain thrives on routine, and that's exactly what builds basketball excellence. Same time, same warm-up, same progression. Your brain's love for structure is your competitive advantage.";
    } 
    // Original responses
    else if (lowerQuestion.includes('left hand') || lowerQuestion.includes('weak hand')) {
        return "Kabir, your left hand is getting stronger every session! Focus on that one-leg shooting for balance. Chris Paul was equally good with both hands - that's your goal too. Keep getting those reps in!";
    } else if (lowerQuestion.includes('shot') || lowerQuestion.includes('shooting')) {
        return "High and soft, Kabir. Three basketballs fit through the rim with proper arc. Aim small, miss small. Hold your finish and pose for the camera. Next shot goes in. Always.";
    } else if (lowerQuestion.includes('tired') || lowerQuestion.includes('fatigue')) {
        return "This is where champions are made, Kabir! Push through the fatigue. Your inner voice is your champion of success. Energy flows from your voice - stay loud, stay moving!";
    } else if (lowerQuestion.includes('motivation') || lowerQuestion.includes('frustrated')) {
        return "You're already SO much better than May, Kabir! Every challenge is building mental toughness. Half the battle is turning awkward into a new normal. Keep believing in yourself!";
    } else {
        return "Great question, Kabir! Remember - your inner voice is your champion of success. Every rep counts, every session matters. Keep working hard and trust the process. You got this!";
    }
}

function displayCoachResponse(response) {
    const responseDiv = document.getElementById('coachResponse');
    responseDiv.innerHTML = `<strong>Coach D:</strong> ${response}`;
    responseDiv.style.display = 'block';
    responseDiv.scrollIntoView({ behavior: 'smooth' });
}

// ==================== MEMORY FUNCTIONALITY ====================
function saveMemory() {
    const memoryText = document.getElementById('memoryInput').value.trim();
    
    if (!memoryText) {
        alert('Please enter something to remember!');
        return;
    }

    const memory = {
        date: new Date().toLocaleDateString(),
        text: memoryText,
        timestamp: Date.now()
    };

    trainingData.memories.unshift(memory);

    document.getElementById('memoryInput').value = '';
    saveData();
    loadMemories();
    
    trackEvent('memory_save', 'personal_development', 'memory_length', memoryText.length);

    alert('Memory saved! 💭 Building your basketball wisdom library.');
}

function loadMemories() {
    const memoriesList = document.getElementById('memoriesList');
    
    if (!memoriesList) return;

    if (trainingData.memories.length === 0) {
        memoriesList.innerHTML = '<p style="text-align: center; color: #ccc;">No memories saved yet. Start building your basketball wisdom!</p>';
        return;
    }

    memoriesList.innerHTML = trainingData.memories.map(memory => `
        <div class="memory-item">
            <div class="memory-date">${memory.date}</div>
            <div class="memory-text">${memory.text}</div>
        </div>
    `).join('');
}

// ==================== DATA PERSISTENCE ====================
function saveData() {
    localStorage.setItem('kabir-training-data', JSON.stringify(trainingData));
}

function loadData() {
    const saved = localStorage.getItem('kabir-training-data');
    if (saved) {
        trainingData = { ...trainingData, ...JSON.parse(saved) };
    }

    // Update all displays
    Object.keys(trainingData).forEach(type => {
        if (['rightHand', 'leftHand', 'threePointers', 'freeThrows', 'trainingTime'].includes(type)) {
            updateDisplay(type);
        }
    });

    updateSessionStats();
    updateProgressBars();
    loadMemories();
}

// ==================== KEYBOARD NAVIGATION ====================
function setupKeyboardNavigation() {
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            
            if (activeElement.id === 'customQuestion') {
                askCustomQuestion();
            }
        }
    });
    
    // Arrow key navigation for tabs
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const currentTab = document.querySelector('.tab-btn.active');
            if (currentTab) {
                const tabs = Array.from(document.querySelectorAll('.tab-btn'));
                const currentIndex = tabs.indexOf(currentTab);
                let nextIndex;
                
                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                } else {
                    nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                }
                
                switchTab(tabs[nextIndex].dataset.tab);
                tabs[nextIndex].focus();
                e.preventDefault();
            }
        }
    });
}

// ==================== ACCESSIBILITY ENHANCEMENTS ====================
function setupAccessibility() {
    // Add ARIA live regions for dynamic content
    const displays = document.querySelectorAll('.score-display');
    displays.forEach(display => {
        display.setAttribute('aria-live', 'polite');
    });
    
    // Enhanced focus management
    const focusableElements = document.querySelectorAll('button, input, textarea, [tabindex]');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Set up all event listeners and functionality
    setupTabNavigation();
    setupKeyboardNavigation();
    setupAccessibility();
    
    // Start button event listener
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startApp);
    }
    
    // Load data
    loadData();
    
    // Track app initialization
    trackEvent('app_initialize', 'system', 'page_load');
});

// ==================== ERROR HANDLING ====================
window.addEventListener('error', function(e) {
    console.log('App error:', e.error);
    trackEvent('app_error', 'system', e.error.message);
});

// ==================== EXPORT FOR TESTING ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateScore,
        askQuickQuestion,
        saveMemory,
        loadData,
        saveData
    };
}