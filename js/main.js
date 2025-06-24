// main.js - Main JavaScript functionality

document.addEventListener('DOMContentLoaded', () => {
  // Loading screen functionality
  const loadingScreen = document.getElementById('loading-screen');
  
  if (loadingScreen) {
      // Hide loading screen after content is loaded
      window.addEventListener('load', () => {
          setTimeout(() => {
              loadingScreen.style.opacity = '0';
              setTimeout(() => {
                  loadingScreen.style.display = 'none';
              }, 500);
          }, 1500); // Adjust timing as needed
      });
  }
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
      const themeIcon = themeToggle.querySelector('.theme-toggle-icon');
      
      // Check for saved theme preference with error handling
      let savedTheme = 'light';
      try {
          const storedTheme = localStorage.getItem('theme');
          if (storedTheme) {
              savedTheme = storedTheme;
          } else {
              // Check for system preference
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              savedTheme = prefersDark ? 'dark' : 'light';
          }
      } catch (error) {
          console.log('Unable to access localStorage. Using default theme.');
      }
      
      // Apply saved theme or system preference
      if (savedTheme === 'dark') {
          document.body.classList.add('dark-theme');
          if (themeIcon) {
              themeIcon.textContent = 'light_mode';
          }
      }
      
      // Toggle theme when button is clicked
      themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-theme');
          
          if (document.body.classList.contains('dark-theme')) {
              if (themeIcon) {
                  themeIcon.textContent = 'light_mode';
              }
              try {
                  localStorage.setItem('theme', 'dark');
              } catch (error) {
                  console.log('Unable to access localStorage. Theme preference will not persist.');
              }
          } else {
              if (themeIcon) {
                  themeIcon.textContent = 'dark_mode';
              }
              try {
                  localStorage.setItem('theme', 'light');
              } catch (error) {
                  console.log('Unable to access localStorage. Theme preference will not persist.');
              }
          }
      });
  }

  // Hamburger menu functionality
  // Ensure this runs after DOM is loaded

  const toggle = document.getElementById('hamburger-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      const expanded = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    // Optional: close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});