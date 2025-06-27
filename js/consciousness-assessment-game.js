// AI Readiness Assessment Game - Interactive Space Orb Experience
class AIReadinessGame {
    constructor() {
        this.isActive = false;
        this.currentScenario = 0;
        this.responses = [];
        this.gameContainer = null;
        this.crosshair = null;
        this.mousePos = { x: 0, y: 0 };
        
        // Assessment scenarios based on Derek's frameworks
        this.scenarios = [
            {
                id: 'ai_adoption',
                question: "Your team is resistant to AI adoption. What's your approach?",
                orbs: [
                    {
                        text: "Force Implementation",
                        color: '#ff4444',
                        points: -10,
                        feedback: "Resistance increases. The CW Standard suggests finding the water in the glass - what aspects do they already accept?"
                    },
                    {
                        text: "Gradual Integration",
                        color: '#ffd700',
                        points: 15,
                        feedback: "Smart approach! Human-AI Orchestration works best when humans feel in control of the process."
                    },
                    {
                        text: "Skip AI Entirely",
                        color: '#888888',
                        points: -5,
                        feedback: "Avoiding the future isn't strategy. Better to find small wins that build confidence."
                    },
                    {
                        text: "Start with Pain Points",
                        color: '#00ff88',
                        points: 25,
                        feedback: "Excellent! Test-Driven Strategy - solve real problems first, then expand success patterns."
                    }
                ]
            },
            {
                id: 'budget_constraints',
                question: "Budget is tight, but you need AI capabilities. Your move?",
                orbs: [
                    {
                        text: "Wait for More Budget",
                        color: '#888888',
                        points: -10,
                        feedback: "Waiting is often the most expensive option. Competitors won't wait."
                    },
                    {
                        text: "DIY with Free Tools",
                        color: '#ff8800',
                        points: 5,
                        feedback: "Resourceful, but without strategy, you might build the wrong thing efficiently."
                    },
                    {
                        text: "Strategic Pilot Project",
                        color: '#00ff88',
                        points: 25,
                        feedback: "Perfect! Start small, prove value, then scale. This is the Water in the Glass approach."
                    },
                    {
                        text: "Outsource Everything",
                        color: '#8b5cf6',
                        points: 10,
                        feedback: "Can work, but you lose internal capability. Better to build some expertise in-house."
                    }
                ]
            },
            {
                id: 'measurement',
                question: "How do you measure AI success in your organization?",
                orbs: [
                    {
                        text: "Cost Savings Only",
                        color: '#ff4444',
                        points: -5,
                        feedback: "Too narrow. AI's biggest wins often come from new capabilities, not just efficiency."
                    },
                    {
                        text: "Revenue Growth",
                        color: '#ffd700',
                        points: 15,
                        feedback: "Good focus on outcomes! Revenue growth shows you're creating real value."
                    },
                    {
                        text: "User Adoption Rates",
                        color: '#00d4ff',
                        points: 20,
                        feedback: "Smart! If people don't use it, it doesn't matter how good it is technically."
                    },
                    {
                        text: "Strategic Capability",
                        color: '#00ff88',
                        points: 25,
                        feedback: "Excellent! Long-term thinking. AI should build capabilities that compound over time."
                    }
                ]
            },
            {
                id: 'team_structure',
                question: "Your ideal AI team structure includes:",
                orbs: [
                    {
                        text: "All Technical Experts",
                        color: '#ff4444',
                        points: -5,
                        feedback: "Technical expertise is crucial, but you need business translators too."
                    },
                    {
                        text: "Mix of Tech + Business",
                        color: '#ffd700',
                        points: 20,
                        feedback: "Good balance! Cross-functional teams prevent the 'cool tech, no business value' trap."
                    },
                    {
                        text: "Dedicated AI Orchestrator",
                        color: '#00ff88',
                        points: 25,
                        feedback: "Perfect! Someone who speaks both languages and can coordinate multiple AI systems."
                    },
                    {
                        text: "Outsourced Team",
                        color: '#8b5cf6',
                        points: 5,
                        feedback: "Can work short-term, but you'll want internal capability for strategic AI initiatives."
                    }
                ]
            },
            {
                id: 'failure_handling',
                question: "When an AI project fails, you:",
                orbs: [
                    {
                        text: "Blame the Technology",
                        color: '#ff4444',
                        points: -15,
                        feedback: "Technology is rarely the real problem. Usually it's strategy, implementation, or expectations."
                    },
                    {
                        text: "Pause All AI Projects",
                        color: '#888888',
                        points: -10,
                        feedback: "One failure doesn't invalidate the entire approach. Better to learn and iterate."
                    },
                    {
                        text: "Analyze and Iterate",
                        color: '#00ff88',
                        points: 25,
                        feedback: "Exactly! Test-Driven Strategy means every failure teaches you something valuable."
                    },
                    {
                        text: "Try Different Vendor",
                        color: '#ff8800',
                        points: 0,
                        feedback: "Maybe, but first understand why it failed. The issue might not be the vendor."
                    }
                ]
            }
        ];
        
        this.assessmentResults = {
            ranges: [
                {
                    min: 90,
                    max: 125,
                    title: "AI Strategy Leader",
                    description: "You have excellent strategic thinking about AI implementation. You understand the human-AI orchestration principles and are ready for advanced AI transformation.",
                    recommendations: [
                        "Consider a strategic AI audit to identify highest-impact opportunities",
                        "Implement a Test-Driven Strategy approach for your next AI initiative",
                        "Build internal AI orchestration capabilities"
                    ],
                    cta: "Book a Strategic AI Consultation"
                },
                {
                    min: 60,
                    max: 89,
                    title: "AI-Ready Professional",
                    description: "You have solid foundations but could benefit from strategic guidance. Your instincts are good, but there are opportunities to accelerate your AI journey.",
                    recommendations: [
                        "Develop a comprehensive AI strategy framework",
                        "Start with pilot projects to build internal confidence",
                        "Learn the Water in the Glass approach to change management"
                    ],
                    cta: "Schedule an AI Readiness Assessment"
                },
                {
                    min: 20,
                    max: 59,
                    title: "AI Explorer",
                    description: "You're beginning your AI journey and asking the right questions. With proper guidance, you can avoid common pitfalls and accelerate your progress.",
                    recommendations: [
                        "Start with the CW Standard framework for strategic thinking",
                        "Identify low-risk, high-impact AI opportunities",
                        "Build a learning plan for AI literacy across your team"
                    ],
                    cta: "Begin with a Foundation Assessment"
                },
                {
                    min: -50,
                    max: 19,
                    title: "AI Skeptic",
                    description: "You have concerns about AI implementation, which is actually valuable. Healthy skepticism, combined with strategic thinking, leads to better outcomes than blind adoption.",
                    recommendations: [
                        "Address specific concerns with targeted use cases",
                        "Start with AI-assisted rather than AI-automated processes",
                        "Focus on human-centered AI implementation"
                    ],
                    cta: "Discuss Your AI Concerns"
                }
            ]
        };
    }
    
    init() {
        this.createGameToggle();
    }
    
    createGameToggle() {
        const existingToggle = document.getElementById('consciousness-toggle');
        if (existingToggle) {
            existingToggle.addEventListener('click', () => this.toggleGame());
        }
    }
    
    toggleGame() {
        if (this.isActive) {
            this.endGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.isActive = true;
        this.currentScenario = 0;
        this.responses = [];
        document.body.style.overflow = 'hidden';
        
        // Update toggle button
        const toggle = document.getElementById('consciousness-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'target');
            }
            toggle.title = 'Exit Assessment Game';
            toggle.classList.add('active');
            if (window.lucide) window.lucide.createIcons();
        }
        
        this.createGameContainer();
        this.createCrosshair();
        this.showIntroduction();
    }
    
    endGame() {
        this.isActive = false;
        document.body.style.overflow = 'auto';
        
        // Reset toggle button
        const toggle = document.getElementById('consciousness-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'brain');
            }
            toggle.title = 'AI Readiness Assessment Game';
            toggle.classList.remove('active');
            if (window.lucide) window.lucide.createIcons();
        }
        
        if (this.gameContainer) {
            this.gameContainer.remove();
            this.gameContainer = null;
        }
    }
    
    createGameContainer() {
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'ai-assessment-game';
        this.gameContainer.style.cssText = `
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, 
                #0a0a0a 0%, 
                #1a1a2e 30%, 
                #16213e  60%, 
                #0f0f23 100%);
            z-index: 9999;
            cursor: none;
            overflow: hidden;
            font-family: var(--font-family);
        `;
        
        this.createStarfield();
        document.body.appendChild(this.gameContainer);
    }
    
    createStarfield() {
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 2 + 1}px;
                height: ${Math.random() * 2 + 1}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.8 + 0.2};
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
            `;
            this.gameContainer.appendChild(star);
        }
        
        // Add CSS animations
        if (!document.getElementById('assessment-game-styles')) {
            const style = document.createElement('style');
            style.id = 'assessment-game-styles';
            style.textContent = `
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
                @keyframes orb-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes orb-spawn {
                    0% { transform: scale(0) rotate(0deg); opacity: 0; }
                    100% { transform: scale(1) rotate(360deg); opacity: 1; }
                }
                @keyframes feedback-slide {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createCrosshair() {
        this.crosshair = document.createElement('div');
        this.crosshair.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            border: 2px solid #00ff88;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            transition: all 0.1s ease;
            box-shadow: 0 0 20px #00ff88;
        `;
        
        // Add crosshair lines
        const hLine = document.createElement('div');
        hLine.style.cssText = `
            position: absolute;
            width: 20px;
            height: 2px;
            background: #00ff88;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        `;
        
        const vLine = document.createElement('div');
        vLine.style.cssText = `
            position: absolute;
            width: 2px;
            height: 20px;
            background: #00ff88;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        `;
        
        this.crosshair.appendChild(hLine);
        this.crosshair.appendChild(vLine);
        this.gameContainer.appendChild(this.crosshair);
        
        // Track mouse movement
        this.gameContainer.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            this.crosshair.style.left = (e.clientX - 15) + 'px';
            this.crosshair.style.top = (e.clientY - 15) + 'px';
        });
    }
    
    showIntroduction() {
        const intro = document.createElement('div');
        intro.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
            max-width: 600px;
            padding: 2rem;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 20px;
            border: 2px solid #00ff88;
        `;
        
        intro.innerHTML = `
            <h2 style="color: #00ff88; margin-bottom: 1rem;">AI Readiness Assessment</h2>
            <p style="margin-bottom: 1.5rem; line-height: 1.6;">
                Navigate through 5 strategic scenarios using your mouse crosshair. 
                Hit the orbs that represent your approach to AI challenges.
            </p>
            <p style="margin-bottom: 2rem; font-size: 0.9rem; opacity: 0.8;">
                Based on Derek's Human-AI Orchestration framework and real client experiences.
            </p>
            <button id="start-assessment" style="
                background: #00ff88;
                color: black;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                font-size: 1rem;
            ">Begin Assessment</button>
        `;
        
        this.gameContainer.appendChild(intro);
        
        document.getElementById('start-assessment').addEventListener('click', () => {
            intro.remove();
            this.showScenario(0);
        });
    }
    
    showScenario(scenarioIndex) {
        if (scenarioIndex >= this.scenarios.length) {
            this.showResults();
            return;
        }
        
        const scenario = this.scenarios[scenarioIndex];
        
        // Create scenario display
        const scenarioDisplay = document.createElement('div');
        scenarioDisplay.id = 'scenario-display';
        scenarioDisplay.style.cssText = `
            position: absolute;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            color: white;
            max-width: 800px;
            padding: 2rem;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 15px;
            border: 2px solid #00d4ff;
            z-index: 10000;
        `;
        
        scenarioDisplay.innerHTML = `
            <h3 style="color: #00d4ff; margin-bottom: 1rem;">Scenario ${scenarioIndex + 1} of ${this.scenarios.length}</h3>
            <p style="font-size: 1.2rem; margin-bottom: 1rem; line-height: 1.5;">${scenario.question}</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">Click the orb that best represents your approach</p>
        `;
        
        this.gameContainer.appendChild(scenarioDisplay);
        
        // Create orbs for this scenario
        scenario.orbs.forEach((orb, index) => {
            setTimeout(() => {
                this.createOrbElement(orb, scenarioIndex, index);
            }, index * 500);
        });
    }
    
    createOrbElement(orb, scenarioIndex, orbIndex) {
        const orbElement = document.createElement('div');
        const orbSize = 120;
        
        // Position orbs in a circle around the center
        const angle = (orbIndex * 2 * Math.PI) / this.scenarios[scenarioIndex].orbs.length;
        const radius = 250;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const x = centerX + Math.cos(angle) * radius - orbSize / 2;
        const y = centerY + Math.sin(angle) * radius - orbSize / 2;
        
        orbElement.style.cssText = `
            position: absolute;
            width: ${orbSize}px;
            height: ${orbSize}px;
            background: ${orb.color};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
            padding: 10px;
            box-shadow: 0 0 30px ${orb.color};
            animation: orb-spawn 0.5s ease-out, orb-pulse 2s infinite;
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        
        orbElement.textContent = orb.text;
        
        orbElement.addEventListener('click', (e) => {
            this.selectResponse(scenarioIndex, orb, orbElement, e);
        });
        
        orbElement.addEventListener('mouseenter', () => {
            orbElement.style.transform = 'scale(1.1)';
            orbElement.style.boxShadow = `0 0 50px ${orb.color}`;
        });
        
        orbElement.addEventListener('mouseleave', () => {
            orbElement.style.transform = 'scale(1)';
            orbElement.style.boxShadow = `0 0 30px ${orb.color}`;
        });
        
        this.gameContainer.appendChild(orbElement);
    }
    
    selectResponse(scenarioIndex, orb, orbElement, event) {
        // Record response
        this.responses.push({
            scenario: this.scenarios[scenarioIndex].id,
            response: orb.text,
            points: orb.points
        });
        
        // Create explosion effect
        this.createExplosion(event.clientX, event.clientY, orb.color);
        
        // Show feedback
        this.showFeedback(orb.feedback, orb.points);
        
        // Remove all orbs for this scenario
        const allOrbs = this.gameContainer.querySelectorAll('div[style*="border-radius: 50%"]:not([id="crosshair"])');
        allOrbs.forEach(orb => orb.remove());
        
        // Remove scenario display
        const scenarioDisplay = document.getElementById('scenario-display');
        if (scenarioDisplay) scenarioDisplay.remove();
        
        // Move to next scenario after delay
        setTimeout(() => {
            this.currentScenario++;
            this.showScenario(this.currentScenario);
        }, 3000);
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                z-index: 10000;
            `;
            
            const angle = (i * 2 * Math.PI) / 12;
            const velocity = 100 + Math.random() * 50;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { 
                    transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
            
            this.gameContainer.appendChild(particle);
        }
    }
    
    showFeedback(feedback, points) {
        const feedbackElement = document.createElement('div');
        feedbackElement.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1.5rem;
            border-radius: 15px;
            border: 2px solid ${points > 0 ? '#00ff88' : '#ff4444'};
            max-width: 600px;
            text-align: center;
            animation: feedback-slide 0.5s ease-out;
            z-index: 10001;
        `;
        
        feedbackElement.innerHTML = `
            <div style="color: ${points > 0 ? '#00ff88' : '#ff4444'}; font-weight: bold; margin-bottom: 0.5rem;">
                ${points > 0 ? '+' : ''}${points} points
            </div>
            <p style="line-height: 1.5; margin: 0;">${feedback}</p>
        `;
        
        this.gameContainer.appendChild(feedbackElement);
        
        setTimeout(() => {
            feedbackElement.remove();
        }, 2800);
    }
    
    showResults() {
        const totalPoints = this.responses.reduce((sum, response) => sum + response.points, 0);
        const result = this.assessmentResults.ranges.find(range => 
            totalPoints >= range.min && totalPoints <= range.max
        );
        
        const resultsContainer = document.createElement('div');
        resultsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 3rem;
            border-radius: 20px;
            border: 3px solid #00ff88;
            max-width: 700px;
            text-align: center;
            z-index: 10002;
        `;
        
        resultsContainer.innerHTML = `
            <h2 style="color: #00ff88; margin-bottom: 1rem;">Assessment Complete!</h2>
            <div style="font-size: 2rem; margin-bottom: 1rem;">${totalPoints} Points</div>
            <h3 style="color: #00d4ff; margin-bottom: 1rem;">${result.title}</h3>
            <p style="line-height: 1.6; margin-bottom: 2rem;">${result.description}</p>
            
            <div style="text-align: left; margin-bottom: 2rem;">
                <h4 style="color: #ffd700; margin-bottom: 1rem;">Recommended Next Steps:</h4>
                <ul style="line-height: 1.8;">
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button id="book-consultation" style="
                    background: #00ff88;
                    color: black;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                ">${result.cta}</button>
                <button id="retake-assessment" style="
                    background: transparent;
                    color: #00d4ff;
                    border: 2px solid #00d4ff;
                    padding: 10px 22px;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                ">Retake Assessment</button>
                <button id="close-game" style="
                    background: transparent;
                    color: #888;
                    border: 2px solid #888;
                    padding: 10px 22px;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 1rem;
                ">Close</button>
            </div>
        `;
        
        this.gameContainer.appendChild(resultsContainer);
        
        // Add event listeners
        document.getElementById('book-consultation').addEventListener('click', () => {
            window.open('pages/contact.html', '_blank');
            this.endGame();
        });
        
        document.getElementById('retake-assessment').addEventListener('click', () => {
            resultsContainer.remove();
            this.currentScenario = 0;
            this.responses = [];
            this.showIntroduction();
        });
        
        document.getElementById('close-game').addEventListener('click', () => {
            this.endGame();
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new AIReadinessGame();
    game.init();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIReadinessGame;
}
