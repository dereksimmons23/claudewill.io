// Global JavaScript - Consistent functionality across all pages

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all functionality
  initThemeToggle();
  initHamburgerMenu();
  initConsciousnessToggle();
  initLoadingScreen();
});

// Theme Toggle Functionality - Automatic based on system preferences
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');

  // Apply system preference by default
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = prefersDark ? 'dark' : 'light';

  // Check for saved user preference (overrides system)
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      currentTheme = savedTheme;
    }
  } catch {
    console.log('Unable to access localStorage.');
  }

  // Apply theme
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Update toggle button icon if it exists
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', currentTheme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }

    // Handle manual theme toggle
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');

      // Update icon
      if (themeIcon) {
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (window.lucide) window.lucide.createIcons();
      }

      // Save preference
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch {
        console.log('Unable to save theme preference.');
      }
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only apply system change if user hasn't set a preference
    try {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const shouldBeDark = e.matches;
        if (shouldBeDark) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }

        // Update icon if toggle exists
        if (themeToggle) {
          const themeIcon = themeToggle.querySelector('i');
          if (themeIcon) {
            themeIcon.setAttribute('data-lucide', shouldBeDark ? 'sun' : 'moon');
            if (window.lucide) window.lucide.createIcons();
          }
        }
      }
    } catch {
      // Silently handle localStorage errors
    }
  });
}

// Hamburger Menu Functionality
function initHamburgerMenu() {
  const toggle = document.getElementById('hamburger-toggle');
  const nav = document.getElementById('main-nav');
  
  if (!toggle || !nav) return;
  
  const menuIcon = toggle.querySelector('i');
  
  toggle.addEventListener('click', function() {
    const expanded = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', expanded);
    
    // Update icon
    if (menuIcon) {
      menuIcon.setAttribute('data-lucide', expanded ? 'x' : 'menu');
      if (window.lucide) window.lucide.createIcons();
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      
      // Reset icon
      if (menuIcon) {
        menuIcon.setAttribute('data-lucide', 'menu');
        if (window.lucide) window.lucide.createIcons();
      }
    }
  });
}

// Consciousness Toggle (for homepage only)
function initConsciousnessToggle() {
  // Completely removed to avoid conflicts with consciousness-navigation.js
  // The SpaceOrbGame class handles the consciousness toggle button entirely
}

// Loading Screen
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  
  if (loadingScreen) {
    // Hide loading screen after content is loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }, 1500);
    });
  }
}

// Utility function to ensure Lucide icons are created
function ensureLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Initialize icons when Lucide loads
if (window.lucide) {
  ensureLucideIcons();
} else {
  // Wait for Lucide to load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(ensureLucideIcons, 100);
  });
} 