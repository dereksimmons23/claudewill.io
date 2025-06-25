// Consciousness Navigation System - Gamified Site Navigation
class ConsciousnessNavigation {
    constructor() {
        this.isActive = false;
        this.level = parseInt(localStorage.getItem('consciousness-level') || '1');
        this.experience = parseInt(localStorage.getItem('consciousness-experience') || '0');
        this.maxExperience = parseInt(localStorage.getItem('consciousness-max-exp') || '100');
        this.visitedNodes = new Set(JSON.parse(localStorage.getItem('visited-nodes') || '[]'));
        this.achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        
        this.nodeData = {
            assessment: {
                title: 'AI Assessment Portal',
                description: 'Discover your AI readiness through revolutionary assessment',
                icon: '🧠',
                color: '#00d4ff',
                url: 'pages/assessment.html',
                experience: 25,
                position: { x: 20, y: 30 }
            },
            resume: {
                title: 'AI-Enhanced Resume',
                description: 'Experience the future of resume optimization',
                icon: '📄',
                color: '#8b5cf6',
                url: 'pages/resume.html',
                experience: 20,
                position: { x: 70, y: 20 }
            },
            portfolio: {
                title: 'Creative Portfolio',
                description: 'Explore innovative AI and design solutions',
                icon: '🎨',
                color: '#00ff88',
                url: 'pages/portfolio.html',
                experience: 30,
                position: { x: 80, y: 60 }
            },
            about: {
                title: 'The Human Behind AI',
                description: 'Philosophy of human-AI collaboration',
                icon: '👤',
                color: '#ff6b35',
                url: 'pages/about.html',
                experience: 15,
                position: { x: 50, y: 70 }
            },
            projects: {
                title: 'Innovation Lab',
                description: 'Cutting-edge AI boundary-pushing projects',
                icon: '🚀',
                color: '#ff0080',
                url: 'pages/projects.html',
                experience: 35,
                position: { x: 15, y: 65 }
            },
            services: {
                title: 'AI Services',
                description: 'Professional AI consulting and solutions',
                icon: '⚡',
                color: '#ffd700',
                url: 'pages/services.html',
                experience: 25,
                position: { x: 45, y: 25 }
            }
        };
    }
    
    init() {
        this.createConsciousnessToggle();
        this.setupEventListeners();
        this.loadProgress();
    }
    
    createConsciousnessToggle() {
        // Use existing consciousness toggle button in header
        const existingToggle = document.getElementById('consciousness-toggle');
        if (existingToggle) {
            existingToggle.addEventListener('click', () => this.toggleConsciousnessMode());
        }
    }
    
    toggleConsciousnessMode() {
        if (this.isActive) {
            this.deactivateConsciousnessMode();
        } else {
            this.activateConsciousnessMode();
        }
    }
    
    activateConsciousnessMode() {
        this.isActive = true;
        document.body.classList.add('consciousness-mode');
        
        // Create consciousness overlay
        this.createConsciousnessOverlay();
        
        // Update toggle button
        const toggle = document.getElementById('consciousness-toggle');
        const icon = toggle.querySelector('i');
        icon.setAttribute('data-lucide', 'sparkles');
        toggle.title = 'Exit Consciousness Mode';
        toggle.classList.add('active');
        if (window.lucide) window.lucide.createIcons();
    }
    
    deactivateConsciousnessMode() {
        this.isActive = false;
        document.body.classList.remove('consciousness-mode');
        
        // Remove consciousness overlay
        const overlay = document.getElementById('consciousness-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Reset toggle button
        const toggle = document.getElementById('consciousness-toggle');
        const icon = toggle.querySelector('i');
        icon.setAttribute('data-lucide', 'brain-circuit');
        toggle.title = 'Enter Consciousness Mode';
        toggle.classList.remove('active');
        if (window.lucide) window.lucide.createIcons();
    }
    
    createConsciousnessOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'consciousness-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, 
                rgba(0, 0, 0, 0.95) 0%, 
                rgba(15, 23, 42, 0.98) 50%, 
                rgba(0, 0, 0, 0.95) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 9999;
            cursor: default;
            overflow: hidden;
        `;
        
        // Add modern ambient background
        const ambient = document.createElement('div');
        ambient.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
            animation: ambient-flow 20s ease-in-out infinite;
        `;
        overlay.appendChild(ambient);
        
        // Add subtle grid overlay
        const grid = document.createElement('div');
        grid.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 60px 60px;
            opacity: 0.3;
            pointer-events: none;
        `;
        overlay.appendChild(grid);
        
        // Add service nodes with modern design
        Object.entries(this.nodeData).forEach(([key, data]) => {
            const node = this.createModernServiceNode(key, data);
            overlay.appendChild(node);
        });
        
        // Add modern UI elements
        this.createModernConsciousnessUI(overlay);
        
        document.body.appendChild(overlay);
        
        // Add modern event listeners
        this.setupModernConsciousnessEvents(overlay);
        
        // Add modern animations
        this.addModernAnimations();
    }
    
    createModernServiceNode(key, data) {
        const node = document.createElement('div');
        node.className = 'modern-consciousness-node';
        node.dataset.service = key;
        
        const { x, y } = data.position;
        node.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: 120px;
            height: 120px;
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        // Modern glassmorphism card
        const card = document.createElement('div');
        card.style.cssText = `
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            position: relative;
            overflow: hidden;
        `;
        
        // Animated background glow
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, 
                ${data.color}40, 
                transparent, 
                ${data.color}20);
            border-radius: 22px;
            opacity: 0;
            transition: opacity 0.4s ease;
            z-index: -1;
        `;
        card.appendChild(glow);
        
        // Modern icon with Lucide
        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = `
            width: 32px;
            height: 32px;
            color: ${data.color};
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', this.getModernIcon(key));
        icon.style.cssText = `
            width: 32px;
            height: 32px;
            stroke-width: 1.5;
        `;
        iconWrapper.appendChild(icon);
        card.appendChild(iconWrapper);
        
        // Modern typography
        const title = document.createElement('div');
        title.textContent = data.title.split(' ')[0]; // First word only for cleaner look
        title.style.cssText = `
            font-size: 11px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            letter-spacing: 0.5px;
            line-height: 1.2;
        `;
        card.appendChild(title);
        
        // Experience indicator
        const xpBadge = document.createElement('div');
        xpBadge.textContent = `+${data.experience}`;
        xpBadge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: ${data.color};
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 12px;
            transform: scale(0);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        card.appendChild(xpBadge);
        
        node.appendChild(card);
        
        // Modern hover effects
        node.addEventListener('mouseenter', () => {
            node.style.transform = 'translate(-50%, -50%) scale(1.1)';
            glow.style.opacity = '1';
            xpBadge.style.transform = 'scale(1)';
        });
        
        node.addEventListener('mouseleave', () => {
            node.style.transform = 'translate(-50%, -50%) scale(1)';
            glow.style.opacity = '0';
            xpBadge.style.transform = 'scale(0)';
        });
        
        return node;
    }
    
    getModernIcon(service) {
        const iconMap = {
            assessment: 'brain',
            resume: 'file-text',
            portfolio: 'palette',
            about: 'user',
            projects: 'rocket',
            services: 'zap'
        };
        return iconMap[service] || 'circle';
    }
    
    createModernConsciousnessUI(overlay) {
        // Modern minimal UI panel
        const uiPanel = document.createElement('div');
        uiPanel.style.cssText = `
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        // Level indicator
        const levelDisplay = document.createElement('div');
        levelDisplay.innerHTML = `
            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 2px;">LEVEL</div>
            <div style="font-size: 18px; font-weight: 700; color: white;">${this.level}</div>
        `;
        uiPanel.appendChild(levelDisplay);
        
        // Modern progress bar
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 200px;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'modern-progress-bar';
        const progressPercent = (this.experience / this.maxExperience) * 100;
        progressBar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 4px;
            width: ${progressPercent}%;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        progressContainer.appendChild(progressBar);
        uiPanel.appendChild(progressContainer);
        
        // XP display
        const xpDisplay = document.createElement('div');
        xpDisplay.innerHTML = `
            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-bottom: 2px;">XP</div>
            <div style="font-size: 14px; font-weight: 600; color: white;">${this.experience}/${this.maxExperience}</div>
        `;
        uiPanel.appendChild(xpDisplay);
        
        overlay.appendChild(uiPanel);
        
        // Modern exit button
        const exitButton = document.createElement('button');
        exitButton.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        const exitIcon = document.createElement('i');
        exitIcon.setAttribute('data-lucide', 'x');
        exitIcon.style.cssText = 'width: 20px; height: 20px;';
        exitButton.appendChild(exitIcon);
        
        exitButton.addEventListener('click', () => this.deactivateConsciousnessMode());
        exitButton.addEventListener('mouseenter', () => {
            exitButton.style.background = 'rgba(255, 255, 255, 0.15)';
        });
        exitButton.addEventListener('mouseleave', () => {
            exitButton.style.background = 'rgba(255, 255, 255, 0.08)';
        });
        
        overlay.appendChild(exitButton);
        
        // Initialize Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }
    
    setupModernConsciousnessEvents(overlay) {
        // Modern click handling
        overlay.addEventListener('click', (e) => {
            const node = e.target.closest('.modern-consciousness-node');
            if (node) {
                this.activateModernConsciousnessNode(node);
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'Escape') {
                this.deactivateConsciousnessMode();
            }
            
            // Number keys for quick access
            const numKey = parseInt(e.key);
            if (numKey >= 1 && numKey <= 6) {
                const services = Object.keys(this.nodeData);
                const service = services[numKey - 1];
                if (service) {
                    const node = overlay.querySelector(`[data-service="${service}"]`);
                    if (node) this.activateModernConsciousnessNode(node);
                }
            }
        });
    }
    
    activateModernConsciousnessNode(node) {
        const service = node.dataset.service;
        const data = this.nodeData[service];
        
        // Modern activation effect
        const card = node.querySelector('div');
        card.style.transform = 'scale(0.95)';
        card.style.background = `${data.color}20`;
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
            card.style.background = 'rgba(255, 255, 255, 0.08)';
        }, 200);
        
        // Create modern ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            inset: 0;
            border-radius: 20px;
            background: radial-gradient(circle, ${data.color}40 0%, transparent 70%);
            transform: scale(0);
            animation: modern-ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        `;
        
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
        
        // Add to visited and gain XP
        this.visitedNodes.add(service);
        this.gainExperience(data.experience);
        
        // Navigate after delay
        setTimeout(() => {
            window.location.href = data.url;
        }, 600);
    }
    
    addModernAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ambient-flow {
                0%, 100% { transform: rotate(0deg) scale(1); }
                33% { transform: rotate(1deg) scale(1.02); }
                66% { transform: rotate(-1deg) scale(0.98); }
            }
            
            @keyframes modern-ripple {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(4); opacity: 0; }
            }
            
            .modern-consciousness-node {
                animation: float-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            
            @keyframes float-in {
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    gainExperience(amount) {
        this.experience += amount;
        
        if (this.experience >= this.maxExperience) {
            this.levelUp();
        }
        
        this.updateExperienceBar();
        this.saveProgress();
    }
    
    levelUp() {
        this.level++;
        this.experience = 0;
        this.maxExperience = Math.floor(this.maxExperience * 1.5);
        
        this.showAchievement('Level Up!', `Consciousness Level ${this.level} achieved!`);
    }
    
    updateExperienceBar() {
        const fill = document.getElementById('modern-progress-bar');
        if (fill) {
            fill.style.width = `${(this.experience / this.maxExperience) * 100}%`;
        }
    }
    
    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: rgba(0,0,0,0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            color: white;
            text-align: center;
            z-index: 10004;
            border: 2px solid #00d4ff;
            max-width: 300px;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        achievement.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">🏆</div>
            <h2 style="color: #00d4ff; margin-bottom: 10px;">${title}</h2>
            <p style="margin-bottom: 20px;">${description}</p>
            <button onclick="this.parentElement.remove()" style="
                background: #00d4ff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
            ">Continue</button>
        `;
        
        document.body.appendChild(achievement);
        requestAnimationFrame(() => {
            achievement.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        setTimeout(() => {
            if (achievement.parentElement) {
                achievement.remove();
            }
        }, 5000);
    }
    
    saveProgress() {
        localStorage.setItem('consciousness-level', this.level.toString());
        localStorage.setItem('consciousness-experience', this.experience.toString());
        localStorage.setItem('consciousness-max-exp', this.maxExperience.toString());
        localStorage.setItem('visited-nodes', JSON.stringify([...this.visitedNodes]));
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }
    
    loadProgress() {
        // Progress is loaded in constructor
        this.updateExperienceBar();
    }
    
    setupEventListeners() {
        // Add consciousness mode hint to existing pages
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                if (!this.visitedNodes.size) {
                    this.showConsciousnessHint();
                }
            }, 3000);
        }
    }
    
    showConsciousnessHint() {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(0,212,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0,212,255,0.3);
            border-radius: 15px;
            padding: 15px;
            color: white;
            font-size: 14px;
            max-width: 250px;
            z-index: 1000;
            animation: hint-pulse 3s ease-in-out infinite;
        `;
        
        hint.innerHTML = `
            <div style="margin-bottom: 10px;">🧠 <strong>New:</strong> Consciousness Mode</div>
            <div style="opacity: 0.8; font-size: 12px;">Click the brain icon to explore the site as an interactive consciousness network!</div>
            <button onclick="this.parentElement.remove()" style="
                background: transparent;
                border: 1px solid rgba(0,212,255,0.5);
                color: #00d4ff;
                padding: 5px 10px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 12px;
                margin-top: 10px;
            ">Got it</button>
        `;
        
        document.body.appendChild(hint);
        
        setTimeout(() => {
            if (hint.parentElement) {
                hint.remove();
            }
        }, 10000);
    }
}

// Initialize consciousness navigation
document.addEventListener('DOMContentLoaded', () => {
    window.consciousnessNav = new ConsciousnessNavigation();
    window.consciousnessNav.init();
});

// Add hint pulse animation
const hintStyle = document.createElement('style');
hintStyle.textContent = `
    @keyframes hint-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(hintStyle);