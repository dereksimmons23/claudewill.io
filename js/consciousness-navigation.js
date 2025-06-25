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
        // Add consciousness mode toggle to existing header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const toggleButton = document.createElement('button');
            toggleButton.id = 'consciousness-toggle';
            toggleButton.className = 'neural-button';
            toggleButton.innerHTML = '🧠';
            toggleButton.title = 'Enter Consciousness Mode';
            toggleButton.style.cssText = `
                width: 2.5rem;
                height: 2.5rem;
                border: 1px solid var(--border);
                background: var(--surface);
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--transition-fast);
                font-size: 1.2rem;
            `;
            
            toggleButton.addEventListener('click', () => this.toggleConsciousnessMode());
            headerActions.appendChild(toggleButton);
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
        toggle.innerHTML = '🌟';
        toggle.title = 'Exit Consciousness Mode';
        toggle.style.background = 'var(--accent)';
        toggle.style.color = 'white';
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
        toggle.innerHTML = '🧠';
        toggle.title = 'Enter Consciousness Mode';
        toggle.style.background = 'var(--surface)';
        toggle.style.color = 'var(--text-primary)';
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
            background: rgba(0, 0, 0, 0.95);
            z-index: 9999;
            cursor: none;
            perspective: 1000px;
        `;
        
        // Add consciousness field
        const field = document.createElement('div');
        field.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, 
                rgba(0,212,255,0.1) 0%, 
                rgba(139,92,246,0.05) 30%, 
                transparent 70%);
            animation: consciousness-pulse 8s ease-in-out infinite;
        `;
        overlay.appendChild(field);
        
        // Add neural grid
        const grid = document.createElement('div');
        grid.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-flow 20s linear infinite;
            pointer-events: none;
        `;
        overlay.appendChild(grid);
        
        // Add service nodes
        Object.entries(this.nodeData).forEach(([key, data]) => {
            const node = this.createServiceNode(key, data);
            overlay.appendChild(node);
        });
        
        // Add UI elements
        this.createConsciousnessUI(overlay);
        
        // Add custom cursor
        const cursor = document.createElement('div');
        cursor.id = 'consciousness-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 30px;
            height: 30px;
            background: conic-gradient(from 0deg, transparent, #00d4ff, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            animation: cursor-spin 2s linear infinite;
        `;
        overlay.appendChild(cursor);
        
        // Add animations
        this.addConsciousnessAnimations();
        
        document.body.appendChild(overlay);
        
        // Setup consciousness event listeners
        this.setupConsciousnessEvents(overlay);
    }
    
    createServiceNode(key, data) {
        const node = document.createElement('div');
        node.className = 'consciousness-service-node';
        node.id = `consciousness-${key}`;
        node.style.cssText = `
            position: absolute;
            width: 120px;
            height: 120px;
            left: ${data.position.x}%;
            top: ${data.position.y}%;
            border-radius: 50%;
            background: conic-gradient(from 0deg, ${data.color}, transparent, ${data.color});
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border: 2px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            animation: node-float 6s ease-in-out infinite;
            animation-delay: ${Object.keys(this.nodeData).indexOf(key) * 0.5}s;
            transform: translateX(-50%) translateY(-50%);
        `;
        
        node.innerHTML = `
            <div style="font-size: 36px; margin-bottom: 8px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));">
                ${data.icon}
            </div>
            <div style="color: white; font-size: 12px; font-weight: 600; text-align: center; text-shadow: 0 0 10px rgba(0,0,0,0.8);">
                ${key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
        `;
        
        // Add progress ring
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute;
            width: 140px;
            height: 140px;
            border: 3px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            border-top-color: ${data.color};
            animation: progress-spin 3s linear infinite;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        node.appendChild(ring);
        
        return node;
    }
    
    createConsciousnessUI(overlay) {
        // Experience bar
        const expBar = document.createElement('div');
        expBar.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            z-index: 10000;
        `;
        
        const expFill = document.createElement('div');
        expFill.id = 'consciousness-exp-fill';
        expFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #8b5cf6, #00ff88);
            width: ${(this.experience / this.maxExperience) * 100}%;
            transition: width 1s ease;
            border-radius: 2px;
        `;
        expBar.appendChild(expFill);
        overlay.appendChild(expBar);
        
        // Level indicator
        const levelIndicator = document.createElement('div');
        levelIndicator.style.cssText = `
            position: fixed;
            top: 35px;
            left: 20px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
        `;
        levelIndicator.textContent = `Consciousness Level ${this.level}`;
        overlay.appendChild(levelIndicator);
        
        // Instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,212,255,0.2);
            backdrop-filter: blur(10px);
            border-radius: 25px;
            padding: 15px 25px;
            color: white;
            font-size: 14px;
            border: 1px solid rgba(0,212,255,0.3);
            text-align: center;
            z-index: 10000;
        `;
        instructions.innerHTML = `
            Click nodes to explore • Press ESC to exit • Gain experience through interaction<br>
            <span style="opacity: 0.7;">Level ${this.level} • ${this.visitedNodes.size}/${Object.keys(this.nodeData).length} nodes explored</span>
        `;
        overlay.appendChild(instructions);
        
        // Exit button
        const exitButton = document.createElement('button');
        exitButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border: none;
            background: rgba(255,255,255,0.1);
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        exitButton.innerHTML = '×';
        exitButton.addEventListener('click', () => this.deactivateConsciousnessMode());
        overlay.appendChild(exitButton);
    }
    
    setupConsciousnessEvents(overlay) {
        // Custom cursor tracking
        overlay.addEventListener('mousemove', (e) => {
            const cursor = document.getElementById('consciousness-cursor');
            if (cursor) {
                cursor.style.left = e.clientX - 15 + 'px';
                cursor.style.top = e.clientY - 15 + 'px';
            }
        });
        
        // Node interactions
        overlay.querySelectorAll('.consciousness-service-node').forEach(node => {
            node.addEventListener('click', () => this.activateConsciousnessNode(node));
            node.addEventListener('mouseenter', () => this.showNodeInfo(node));
            node.addEventListener('mouseleave', () => this.hideNodeInfo());
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivateConsciousnessMode();
            }
        });
    }
    
    activateConsciousnessNode(node) {
        const nodeKey = node.id.replace('consciousness-', '');
        const data = this.nodeData[nodeKey];
        
        // Visual feedback
        node.style.transform = 'translateX(-50%) translateY(-50%) scale(1.5)';
        node.style.boxShadow = `0 0 80px ${data.color}`;
        
        // Gain experience
        this.gainExperience(data.experience);
        
        // Mark as visited
        this.visitedNodes.add(nodeKey);
        this.saveProgress();
        
        // Create explosion effect
        this.createExplosionEffect(node, data.color);
        
        // Navigate after delay
        setTimeout(() => {
            this.deactivateConsciousnessMode();
            if (data.url) {
                window.location.href = data.url;
            }
        }, 1500);
    }
    
    createExplosionEffect(node, color) {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                left: ${centerX}px;
                top: ${centerY}px;
                pointer-events: none;
                z-index: 10002;
            `;
            
            const angle = (i / 20) * Math.PI * 2;
            const distance = 100 + Math.random() * 100;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 2000,
                easing: 'ease-out'
            });
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }
    }
    
    showNodeInfo(node) {
        const nodeKey = node.id.replace('consciousness-', '');
        const data = this.nodeData[nodeKey];
        const rect = node.getBoundingClientRect();
        
        const info = document.createElement('div');
        info.id = 'consciousness-node-info';
        info.style.cssText = `
            position: fixed;
            left: ${rect.right + 20}px;
            top: ${rect.top - 50}px;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(20px);
            border-radius: 15px;
            padding: 20px;
            color: white;
            max-width: 250px;
            z-index: 10003;
            border: 1px solid ${data.color};
            transform: scale(0);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        info.innerHTML = `
            <h3 style="color: ${data.color}; margin-bottom: 10px; font-size: 16px;">${data.title}</h3>
            <p style="font-size: 14px; line-height: 1.4; margin-bottom: 15px;">${data.description}</p>
            <div style="font-size: 12px; opacity: 0.7;">+${data.experience} XP</div>
        `;
        
        document.body.appendChild(info);
        requestAnimationFrame(() => {
            info.style.transform = 'scale(1)';
        });
    }
    
    hideNodeInfo() {
        const info = document.getElementById('consciousness-node-info');
        if (info) {
            info.style.transform = 'scale(0)';
            setTimeout(() => info.remove(), 300);
        }
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
        const fill = document.getElementById('consciousness-exp-fill');
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
    
    addConsciousnessAnimations() {
        if (document.getElementById('consciousness-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'consciousness-animations';
        style.textContent = `
            @keyframes consciousness-pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }
            
            @keyframes grid-flow {
                0% { transform: translate(0, 0); }
                100% { transform: translate(50px, 50px); }
            }
            
            @keyframes node-float {
                0%, 100% { transform: translateX(-50%) translateY(-50%) translateZ(0px) rotate(0deg); }
                33% { transform: translateX(-50%) translateY(-50%) translateZ(-10px) rotate(120deg); }
                66% { transform: translateX(-50%) translateY(-50%) translateZ(10px) rotate(240deg); }
            }
            
            @keyframes progress-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes cursor-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .consciousness-service-node:hover {
                transform: translateX(-50%) translateY(-50%) scale(1.2) rotateY(180deg) !important;
                box-shadow: 0 0 60px var(--node-color) !important;
            }
            
            .consciousness-service-node:hover > div:first-child {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
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