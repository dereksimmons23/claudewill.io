/**
 * Device Context Detection & Adaptation Module
 * Enables cross-device intelligence for Recalibrate platform
 * 
 * @author Derek Simmons - Claude Wisdom Strategies
 * @version 1.0.0
 */

class DeviceContext {
    constructor() {
        this.context = this.detectContext();
        this.capabilities = this.detectCapabilities();
        this.preferences = this.loadUserPreferences();
        
        // Event listeners for context changes
        this.setupContextListeners();
    }

    /**
     * Detect current device context
     * @returns {Object} Device context information
     */
    detectContext() {
        const context = {
            // Device type detection
            mobile: window.innerWidth < 768 && this.isTouchDevice(),
            tablet: window.innerWidth >= 768 && window.innerWidth < 1024 && this.isTouchDevice(),
            desktop: window.innerWidth >= 1024 && !this.isTouchDevice(),
            
            // Screen characteristics
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: this.getOrientation(),
            
            // Input capabilities
            touch: this.isTouchDevice(),
            keyboard: !this.isTouchDevice() || this.hasPhysicalKeyboard(),
            mouse: !this.isTouchDevice(),
            
            // Browser capabilities
            browser: this.detectBrowser(),
            pwaSupportLevel: this.detectPWASupport(),
            
            // Network context
            connection: this.getConnectionInfo(),
            
            // Time context
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        return context;
    }

    /**
     * Detect device capabilities for feature optimization
     * @returns {Object} Device capabilities
     */
    detectCapabilities() {
        return {
            // Voice capabilities
            speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            speechSynthesis: 'speechSynthesis' in window,
            
            // Storage capabilities
            indexedDB: 'indexedDB' in window,
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            
            // PWA capabilities
            serviceWorker: 'serviceWorker' in navigator,
            manifest: 'serviceWorker' in navigator,
            installPrompt: this.canInstallPWA(),
            
            // Device features
            camera: this.hasCamera(),
            geolocation: 'geolocation' in navigator,
            vibration: 'vibrate' in navigator,
            
            // Advanced features
            webGL: this.hasWebGL(),
            webRTC: this.hasWebRTC(),
            clipboard: 'clipboard' in navigator,
            share: 'share' in navigator,
            
            // Performance indicators
            hardwareConcurrency: navigator.hardwareConcurrency || 2,
            deviceMemory: navigator.deviceMemory || 4
        };
    }

    /**
     * Get optimal interface configuration for current context
     * @returns {Object} Interface configuration
     */
    getOptimalInterface() {
        const config = {
            // Primary input method
            primaryInput: this.context.mobile ? 'touch' : 'keyboard',
            
            // Navigation style
            navigation: {
                type: this.context.mobile ? 'bottom-tab' : 'sidebar',
                gesture: this.context.touch,
                keyboard: this.context.keyboard
            },
            
            // Content density
            density: this.context.mobile ? 'spacious' : 'compact',
            
            // Touch targets
            touchTargetSize: this.context.touch ? '44px' : '32px',
            
            // Typography
            fontSize: {
                base: this.context.mobile ? '16px' : '14px',
                scale: this.context.mobile ? 1.2 : 1.1
            },
            
            // Voice interface
            voice: {
                primary: this.context.mobile && this.capabilities.speechRecognition,
                secondary: this.context.desktop && this.capabilities.speechRecognition,
                disabled: !this.capabilities.speechRecognition
            },
            
            // Offline capabilities
            offline: {
                priority: this.context.mobile ? 'high' : 'medium',
                storage: this.capabilities.indexedDB ? 'indexedDB' : 'localStorage'
            }
        };

        return config;
    }

    /**
     * Get device-specific feature recommendations
     * @returns {Object} Feature recommendations
     */
    getFeatureRecommendations() {
        const features = {
            // Core features (always enabled)
            core: ['resume-builder', 'ats-intelligence', 'decision-matrix'],
            
            // Context-specific features
            mobile: this.context.mobile ? ['voice-input', 'camera-scan', 'quick-actions'] : [],
            desktop: this.context.desktop ? ['keyboard-shortcuts', 'multi-document', 'advanced-formatting'] : [],
            tablet: this.context.tablet ? ['split-view', 'gesture-navigation', 'hybrid-input'] : [],
            
            // Capability-dependent features
            voice: this.capabilities.speechRecognition ? ['voice-commands', 'dictation', 'voice-feedback'] : [],
            camera: this.capabilities.camera ? ['document-scan', 'business-card-scan'] : [],
            offline: this.capabilities.serviceWorker ? ['offline-editing', 'background-sync'] : [],
            
            // Performance-dependent features
            advanced: this.isHighPerformanceDevice() ? ['real-time-collab', 'video-preview', 'ai-suggestions'] : []
        };

        return features;
    }

    /**
     * Setup event listeners for context changes
     */
    setupContextListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            const newContext = this.detectContext();
            if (this.hasContextChanged(newContext)) {
                this.handleContextChange(newContext);
            }
        });

        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                const newContext = this.detectContext();
                this.handleContextChange(newContext);
            }, 100);
        });

        // Network change
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.context.connection = this.getConnectionInfo();
                this.handleNetworkChange();
            });
        }

        // Keyboard detection
        document.addEventListener('keydown', () => {
            if (!this.context.keyboard) {
                this.context.keyboard = true;
                this.handleInputMethodChange();
            }
        });

        // Touch detection
        document.addEventListener('touchstart', () => {
            if (!this.context.touch) {
                this.context.touch = true;
                this.handleInputMethodChange();
            }
        });
    }

    /**
     * Handle context changes
     * @param {Object} newContext - New device context
     */
    handleContextChange(newContext) {
        const previousContext = this.context;
        this.context = newContext;

        // Emit context change event
        const event = new CustomEvent('deviceContextChange', {
            detail: {
                previous: previousContext,
                current: newContext,
                interface: this.getOptimalInterface(),
                features: this.getFeatureRecommendations()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Handle network changes
     */
    handleNetworkChange() {
        const event = new CustomEvent('networkContextChange', {
            detail: {
                connection: this.context.connection,
                offline: this.context.connection.effectiveType === 'offline'
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Handle input method changes
     */
    handleInputMethodChange() {
        const event = new CustomEvent('inputMethodChange', {
            detail: {
                touch: this.context.touch,
                keyboard: this.context.keyboard,
                interface: this.getOptimalInterface()
            }
        });

        document.dispatchEvent(event);
    }

    // Utility methods

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    hasPhysicalKeyboard() {
        // Detect if device likely has physical keyboard
        return !('ontouchstart' in window) || 
               navigator.userAgent.includes('iPad') && navigator.userAgent.includes('Safari');
    }

    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.type;
        }
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
        if (ua.includes('Firefox')) return 'firefox';
        if (ua.includes('Edge')) return 'edge';
        return 'unknown';
    }

    detectPWASupport() {
        let score = 0;
        if ('serviceWorker' in navigator) score += 25;
        if ('manifest' in document.head.querySelector('link[rel="manifest"]')) score += 25;
        if ('BeforeInstallPromptEvent' in window) score += 25;
        if ('getInstalledRelatedApps' in navigator) score += 25;
        return score;
    }

    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return { effectiveType: 'unknown' };
    }

    canInstallPWA() {
        return 'BeforeInstallPromptEvent' in window || 
               (this.detectBrowser() === 'safari' && 'standalone' in navigator);
    }

    hasCamera() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }

    hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    hasWebRTC() {
        return 'RTCPeerConnection' in window;
    }

    isHighPerformanceDevice() {
        return (this.capabilities.hardwareConcurrency >= 4 && 
                this.capabilities.deviceMemory >= 4) ||
               this.context.desktop;
    }

    hasContextChanged(newContext) {
        return newContext.mobile !== this.context.mobile ||
               newContext.tablet !== this.context.tablet ||
               newContext.desktop !== this.context.desktop;
    }

    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('recalibrate-device-preferences');
            return stored ? JSON.parse(stored) : this.getDefaultPreferences();
        } catch (e) {
            return this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            preferredInterface: 'auto',
            voiceEnabled: true,
            gesturesEnabled: true,
            offlineFirst: true,
            syncAcrossDevices: true
        };
    }

    saveUserPreferences(preferences) {
        try {
            localStorage.setItem('recalibrate-device-preferences', JSON.stringify(preferences));
            this.preferences = { ...this.preferences, ...preferences };
        } catch (e) {
            console.warn('Could not save device preferences:', e);
        }
    }
}

// Initialize device context detection
const deviceContext = new DeviceContext();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceContext;
} else {
    window.DeviceContext = DeviceContext;
    window.deviceContext = deviceContext;
}
