// Global JavaScript - Consistent functionality across all pages

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all functionality
  initThemeToggle();
  initHamburgerMenu();
  initConsciousnessToggle();
  initLoadingScreen();
});

// Theme Toggle Functionality - DISABLED
// Using light mode only to avoid contrast issues
function initThemeToggle() {
  // Force light mode always
  document.body.classList.remove('dark-theme');
  
  // Remove any saved theme preference
  try {
    localStorage.removeItem('theme');
  } catch (error) {
    console.log('Unable to access localStorage.');
  }
  
  // Hide theme toggle button if it exists
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.style.display = 'none';
  }
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