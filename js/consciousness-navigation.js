// Space Orb Game - Beat Saber Style Navigation
class SpaceOrbGame {
    constructor() {
        this.isActive = false;
        this.score = 0;
        this.level = 1;
        this.orbs = [];
        this.particles = [];
        this.gameContainer = null;
        this.crosshair = null;
        this.isMoving = false;
        this.mousePos = { x: 0, y: 0 };
        this.gameSpeed = 1;
        
        this.services = {
            assessment: {
                title: 'AI Assessment', 
                color: '#00d4ff', 
                icon: '🧠',
                url: 'pages/assessment.html',
                points: 100,
                info: "Discover your AI readiness level with our comprehensive assessment. Takes 5 minutes, provides personalized insights."
            },
            resume: {
                title: 'Resume Engine', 
                color: '#8b5cf6', 
                icon: '📄',
                url: 'pages/resume.html',
                points: 80,
                info: "AI-powered resume optimization achieving 67% response rates vs 15% industry average. Real results, real data."
            },
            portfolio: {
                title: 'Portfolio', 
                color: '#00ff88', 
                icon: '🎨',
                url: 'pages/portfolio.html',
                points: 120,
                info: "See real examples of AI transformations, case studies, and client success stories from our work."
            },
            about: {
                title: 'About Derek', 
                color: '#ff6b35', 
                icon: '👤',
                url: 'pages/about.html',
                points: 60,
                info: "Meet Derek Simmons - AI strategist, Kansas native, and the human conductor behind Claude Wisdom Strategies."
            },
            projects: {
                title: 'Live Projects', 
                color: '#ff0080', 
                icon: '🚀',
                url: 'pages/projects.html',
                points: 150,
                info: "Active AI orchestration projects including this website being built in real-time with 5 AI systems."
            },
            services: {
                title: 'Services', 
                color: '#ffd700', 
                icon: '⚡',
                url: 'pages/services.html',
                points: 100,
                info: "Human-AI Orchestration, Test-Driven Strategy, and Water in the Glass frameworks for your organization."
            }
        };
    }
    
    init() {
        this.createGameToggle();
        this.setupEventListeners();
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
        document.body.style.overflow = 'hidden';
        
        // Update toggle button
        const toggle = document.getElementById('consciousness-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'target');
            }
            toggle.title = 'Exit Space Game';
            toggle.classList.add('active');
            if (window.lucide) window.lucide.createIcons();
        }
        
        this.createGameContainer();
        this.createCrosshair();
        this.createHUD();
        this.spawnOrbs();
        this.startGameLoop();
        this.showInstructions();
    }
    
    endGame() {
        this.isActive = false;
        document.body.style.overflow = 'auto';
        
        // Reset toggle button
        const toggle = document.getElementById('consciousness-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'play');
            }
            toggle.title = 'Enter Space Game';
            toggle.classList.remove('active');
            if (window.lucide) window.lucide.createIcons();
        }
        
        if (this.gameContainer) {
            this.gameContainer.remove();
            this.gameContainer = null;
        }
        
        this.orbs = [];
        this.particles = [];
        cancelAnimationFrame(this.gameLoop);
    }
    
    createGameContainer() {
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'space-orb-game';
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
        `;
        
        // Add animated starfield
        this.createStarfield();
        
        document.body.appendChild(this.gameContainer);
    }
    
    createStarfield() {
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
            position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.8 + 0.2};
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
            `;
            this.gameContainer.appendChild(star);
        }
        
        // Add CSS for twinkling stars
        if (!document.getElementById('game-styles')) {
            const style = document.createElement('style');
            style.id = 'game-styles';
            style.textContent = `
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
                @keyframes orb-float {
                    0% { transform: translateY(100vh) scale(0.5); }
                    100% { transform: translateY(-100px) scale(1.2); }
                }
                @keyframes particle-burst {
                    0% { transform: scale(0) rotate(0deg); opacity: 1; }
                    100% { transform: scale(2) rotate(360deg); opacity: 0; }
                }
                @keyframes score-popup {
                    0% { transform: scale(0.5); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1) translateY(-50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createCrosshair() {
        this.crosshair = document.createElement('div');
        this.crosshair.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border: 2px solid #00d4ff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            transition: all 0.1s ease;
            box-shadow: 0 0 20px #00d4ff;
        `;
        
        // Add crosshair lines
        const horizontal = document.createElement('div');
        horizontal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 10%;
            right: 10%;
            height: 2px;
            background: #00d4ff;
            transform: translateY(-50%);
        `;
        
        const vertical = document.createElement('div');
        vertical.style.cssText = `
            position: absolute;
            left: 50%;
            top: 10%;
            bottom: 10%;
            width: 2px;
            background: #00d4ff;
            transform: translateX(-50%);
        `;
        
        this.crosshair.appendChild(horizontal);
        this.crosshair.appendChild(vertical);
        document.body.appendChild(this.crosshair);
    }
    
    createHUD() {
        const hud = document.createElement('div');
        hud.id = 'game-hud';
        hud.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            z-index: 10000;
            pointer-events: none;
        `;
        
        hud.innerHTML = `
            <div style="display: flex; gap: 20px;">
                <div>SCORE: <span id="game-score" style="color: #00d4ff; font-weight: bold;">${this.score}</span></div>
                <div>LEVEL: <span id="game-level" style="color: #00ff88; font-weight: bold;">${this.level}</span></div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; opacity: 0.7;">SHOOT ORBS TO NAVIGATE</div>
                <div style="font-size: 10px; opacity: 0.5;">ESC TO EXIT</div>
            </div>
        `;
        
        this.gameContainer.appendChild(hud);
    }
    
    spawnOrbs() {
        const serviceKeys = Object.keys(this.services);
        
        setInterval(() => {
            if (!this.isActive) return;
            
            const serviceKey = serviceKeys[Math.floor(Math.random() * serviceKeys.length)];
            const service = this.services[serviceKey];
            
            const orb = {
                id: Date.now() + Math.random(),
                element: this.createOrbElement(service, serviceKey),
                service: serviceKey,
                data: service,
                x: Math.random() * (window.innerWidth - 100) + 50,
                y: window.innerHeight + 50,
                speed: Math.random() * 1 + 0.5 + (this.level * 0.3), // Slower, more manageable
                hit: false
            };
            
            this.orbs.push(orb);
            this.gameContainer.appendChild(orb.element);
        }, 3000 - (this.level * 200)); // Spawn slower for better playability
    }
    
    createOrbElement(service, serviceKey) {
        const orb = document.createElement('div');
        orb.style.cssText = `
            position: absolute;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, ${service.color}80, ${service.color}20);
            border: 3px solid ${service.color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: crosshair;
            box-shadow: 0 0 30px ${service.color}60;
            transition: transform 0.2s ease;
            will-change: transform;
        `;
        
        orb.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 4px;">${service.icon}</div>
                <div style="font-size: 10px; color: white; font-weight: bold;">${service.points}</div>
            </div>
        `;
        
        // Add click handler
        orb.addEventListener('click', (e) => this.hitOrb(serviceKey, service, orb, e));
        
        return orb;
    }
    
    hitOrb(serviceKey, service, orbElement, event) {
        if (!this.isActive) return;
        
        // Add score
        this.score += service.points;
        document.getElementById('game-score').textContent = this.score;
        
        // Create explosion effect
        this.createExplosion(event.clientX, event.clientY, service.color);
        
        // Show score popup
        this.showScorePopup(event.clientX, event.clientY, service.points);
        
        // Remove orb
        orbElement.remove();
        this.orbs = this.orbs.filter(orb => orb.element !== orbElement);
        
        // Level up check
        if (this.score >= this.level * 500) {
            this.levelUp();
        }
        
        // Show service info instead of immediate navigation
        this.showServiceInfo(service);
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10002;
                animation: particle-burst 0.8s ease-out forwards;
                transform-origin: center;
            `;
            
            // Random direction
            const angle = (i / 12) * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}px`);
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 800);
        }
    }
    
    showScorePopup(x, y, points) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: #00d4ff;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            font-size: 20px;
            pointer-events: none;
            z-index: 10003;
            animation: score-popup 1s ease-out forwards;
            text-shadow: 0 0 10px #00d4ff;
        `;
        popup.textContent = `+${points}`;
        
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }
    
    showServiceInfo(service) {
        const infoPanel = document.createElement('div');
        infoPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${service.color};
            border-radius: 20px;
            padding: 30px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            text-align: center;
            z-index: 10006;
            max-width: 500px;
            box-shadow: 0 0 40px ${service.color}60;
        `;
        
        infoPanel.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 15px;">${service.icon}</div>
            <h3 style="color: ${service.color}; margin-bottom: 20px; font-size: 24px;">${service.title}</h3>
            <p style="margin-bottom: 25px; line-height: 1.6; font-size: 14px;">${service.info}</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="window.location.href='${service.url}'; this.parentElement.parentElement.remove();" style="
                    background: ${service.color};
                    color: black;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                ">Explore ${service.title}</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    color: ${service.color};
                    border: 2px solid ${service.color};
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                ">Continue Game</button>
            </div>
        `;
        
        this.gameContainer.appendChild(infoPanel);
    }
    
    levelUp() {
        this.level++;
        document.getElementById('game-level').textContent = this.level;
        
        // Show level up notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 212, 255, 0.2);
            border: 2px solid #00d4ff;
            border-radius: 20px;
            padding: 20px 40px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 10004;
            animation: score-popup 2s ease-out forwards;
            box-shadow: 0 0 40px #00d4ff;
        `;
        notification.innerHTML = `
            <div>LEVEL UP!</div>
            <div style="font-size: 16px; opacity: 0.8; margin-top: 10px;">SPEED INCREASED</div>
        `;
        
        this.gameContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
    
    showInstructions() {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00d4ff;
            border-radius: 20px;
            padding: 30px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            text-align: center;
            z-index: 10005;
            max-width: 400px;
        `;
        instructions.innerHTML = `
            <h3 style="color: #00d4ff; margin-bottom: 20px;">🚀 SPACE ORB NAVIGATOR</h3>
            <p style="margin-bottom: 15px;">Shoot the floating service orbs to navigate the site!</p>
            <p style="margin-bottom: 15px;">Each orb takes you to a different page.</p>
            <p style="margin-bottom: 20px; font-size: 12px; opacity: 0.7;">Click orbs • ESC to exit • Higher levels = faster orbs</p>
            <button onclick="this.parentElement.remove()" style="
                background: #00d4ff;
                color: black;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
            ">START GAME</button>
        `;
        
        this.gameContainer.appendChild(instructions);
    }
    
    startGameLoop() {
        let lastTime = 0;
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        
        const loop = (currentTime) => {
            if (!this.isActive) return;
            
            // Throttle to target FPS for better performance
            if (currentTime - lastTime >= frameTime) {
                // Update orb positions (batch DOM updates)
                const orbsToRemove = [];
                
                this.orbs.forEach((orb, index) => {
                    orb.y -= orb.speed;
                    
                    // Batch DOM updates
                    orb.element.style.transform = `translate(${orb.x}px, ${orb.y}px)`;
                    
                    // Mark orbs for removal instead of removing immediately
                    if (orb.y < -100) {
                        orbsToRemove.push(index);
                    }
                });
                
                // Remove orbs in reverse order to maintain indices
                orbsToRemove.reverse().forEach(index => {
                    this.orbs[index].element.remove();
                    this.orbs.splice(index, 1);
                });
                
                lastTime = currentTime;
            }
            
            this.gameLoop = requestAnimationFrame(loop);
        };
        
        loop(0);
    }
    
    setupEventListeners() {
        // Mouse tracking for crosshair
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive || !this.crosshair) return;
            
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            
            this.crosshair.style.left = (e.clientX - 20) + 'px';
            this.crosshair.style.top = (e.clientY - 20) + 'px';
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'Escape') {
                this.endGame();
            }
        });
        
        // Remove crosshair when game ends
        document.addEventListener('click', () => {
            if (!this.isActive && this.crosshair) {
                this.crosshair.remove();
                this.crosshair = null;
            }
        });
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    window.spaceOrbGame = new SpaceOrbGame();
    window.spaceOrbGame.init();
});