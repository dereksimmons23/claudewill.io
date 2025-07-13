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
      const themeIcon = themeToggle.querySelector('i');
      
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
              themeIcon.setAttribute('data-lucide', 'sun');
              if (window.lucide) window.lucide.createIcons();
          }
      }
      
      // Toggle theme when button is clicked
      themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-theme');
          
          if (document.body.classList.contains('dark-theme')) {
              if (themeIcon) {
                  themeIcon.setAttribute('data-lucide', 'sun');
                  if (window.lucide) window.lucide.createIcons();
              }
              try {
                  localStorage.setItem('theme', 'dark');
              } catch (error) {
                  console.log('Unable to access localStorage. Theme preference will not persist.');
              }
          } else {
              if (themeIcon) {
                  themeIcon.setAttribute('data-lucide', 'moon');
                  if (window.lucide) window.lucide.createIcons();
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
    
    // Optional: close menu when clicking outside
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
});

// Counter animation function
function animateCounter(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        if (suffix === '%') {
            element.textContent = currentValue + suffix;
        } else if (suffix === '+' && targetValue >= 1000) {
            element.textContent = (currentValue / 1000).toFixed(1) + 'K' + suffix;
        } else if (suffix === '+' && elementId === 'revenue-counter') {
            element.textContent = '$' + currentValue + 'M' + suffix;
        } else {
            element.textContent = currentValue + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger counter animations when results section is visible
                if (entry.target.closest('.cw-standard-section')) {
                    setTimeout(() => {
                        animateCounter('revenue-counter', 25, 'M+');
                        animateCounter('hours-counter', 2.5, 'K+');
                        animateCounter('response-counter', 67, '%');
                    }, 300);
                }
            }
        });
    }, observerOptions);
    
    // Observe all reveal elements
    document.querySelectorAll('[data-reveal]').forEach(el => {
        observer.observe(el);
    });
}

// Parallax scrolling effect (optional enhancement)
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero-greeting, .heritage-section');
    
    function updateParallax() {
        const scrollY = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const speed = 0.5;
            const yPos = -(scrollY * speed);
            
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
    
    // Only enable parallax on desktop and if user hasn't requested reduced motion
    if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', updateParallax, { passive: true });
    }
}

// Touch-friendly enhancements for mobile
function initMobileEnhancements() {
    // Add touch feedback for interactive elements
    const interactiveElements = document.querySelectorAll('.principle, .story-card, .problem-card, .check-item, .cta-primary, .cta-secondary');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        }, { passive: true });
    });
}

// Enhanced navigation for storytelling sections
function initStorytellingNavigation() {
    // Smooth scroll behavior for CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add active state to navigation based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    function updateActiveNav() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav, { passive: true });
}

// Initialize storytelling features after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize new storytelling features
    initScrollAnimations();
    initParallaxEffect();
    initMobileEnhancements();
    initStorytellingNavigation();
    
    // Legacy counter animation (fallback)
    setTimeout(() => {
        animateCounter('revenue-counter', 25, 'M+');
        animateCounter('hours-counter', 2.5, 'K+');
        animateCounter('response-counter', 67, '%');
    }, 500);
});