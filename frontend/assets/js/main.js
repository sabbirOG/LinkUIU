// Basic API client and token storage
const API_BASE = window.APP_API_BASE || 'http://localhost:8000';

// Animation utilities
function initPageAnimations() {
  // Add fade-in animations to elements
  const animatedElements = document.querySelectorAll('.card, .alumni-card, .event-card, .story-card');
  
  animatedElements.forEach((element, index) => {
    element.classList.add('fade-in-up');
    element.style.animationDelay = `${index * 0.1}s`;
  });
  
  // Add stagger animation to grid items
  const gridItems = document.querySelectorAll('.alumni-grid .alumni-card, .events-grid .event-card, .stories-grid .story-card');
  gridItems.forEach((item, index) => {
    item.classList.add('fade-in-up');
    item.style.animationDelay = `${index * 0.15}s`;
  });
}

// Password toggle functionality
function initPasswordToggles() {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  passwordFields.forEach(passwordInput => {
    // Check if toggle already exists
    if (passwordInput.parentNode.querySelector('.password-toggle')) {
      return;
    }
    
    // Create password field wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'password-field';
    
    // Insert wrapper before password input
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'password-toggle';
    toggleButton.innerHTML = '👁️';
    toggleButton.setAttribute('aria-label', 'Toggle password visibility');
    
    // Add toggle button to wrapper
    wrapper.appendChild(toggleButton);
    
    // Add click event listener
    toggleButton.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleButton.innerHTML = isPassword ? '🙈' : '👁️';
      toggleButton.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
}

// Mobile menu functionality
let mobileMenuInitialized = false;

function initMobileMenu() {
  // Prevent multiple initializations
  if (mobileMenuInitialized) {
    console.log('Mobile menu already initialized, skipping');
    return;
  }
  
  console.log('Initializing mobile menu...');
  
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  
  if (!hamburger || !mobileNav) {
    console.warn('Mobile menu elements not found:', { hamburger: !!hamburger, mobileNav: !!mobileNav });
    return;
  }

  console.log('Mobile menu elements found, setting up event listeners');

  // Add event listener to hamburger
  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Hamburger clicked');
    toggleMobileMenu();
  });

  // Add event listener to close button
  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked');
      closeMobileMenu();
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (mobileNav.classList.contains('active') && 
        !e.target.closest('.mobile-nav') && 
        !e.target.closest('.hamburger')) {
      console.log('Clicked outside, closing menu');
      closeMobileMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      console.log('Escape pressed, closing menu');
      closeMobileMenu();
    }
  });
  
  mobileMenuInitialized = true;
  console.log('Mobile menu initialization complete');
}

function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;
  
  if (!hamburger || !mobileNav) {
    return;
  }
  
  // Prevent multiple rapid clicks
  if (hamburger.classList.contains('processing')) {
    return;
  }
  
  hamburger.classList.add('processing');
  
  const isActive = hamburger.classList.contains('active');
  
  if (isActive) {
    // Close menu
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    body.classList.remove('menu-open');
  } else {
    // Open menu
    hamburger.classList.add('active');
    mobileNav.classList.add('active');
    body.classList.add('menu-open');
  }
  
  // Remove processing class after animation
  setTimeout(() => {
    hamburger.classList.remove('processing');
  }, 300);
}


function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;

  if (hamburger) hamburger.classList.remove('active');
  if (mobileNav) mobileNav.classList.remove('active');
  if (body) body.classList.remove('menu-open');
}

// Initialize animations and navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initPageAnimations();
  highlightActivePage();
  initPasswordToggles();
  
  // Initialize mobile menu with a small delay to ensure DOM is fully ready
  setTimeout(() => {
    initMobileMenu();
  }, 100);
  
  // Add home link functionality
  const homeLink = document.getElementById('home-link');
  
  if (homeLink) {
    homeLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    });
  }
});

function saveAuth({ token, user }) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('auth_token');
}

function getAuthHeaders() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) Object.assign(headers, getAuthHeaders());
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    let data = null;
    try { data = await res.json(); } catch (_) {}
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (!location.pathname.endsWith('/login.html')) {
          location.href = './login.html';
        }
      }
      const msg = (data && (data.error || data.message)) || 'Request failed';
      throw new Error(msg);
    }
    return data;
  } catch (error) {
    // Handle network errors (server not running, connection issues, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Temporarily disabled connection error popup
      console.log('Network error detected, but popup disabled');
      throw new Error('Cannot connect to server. Please check if the backend server is running.');
    }
    throw error;
  }
}

async function apiMultipart(path, formData, { auth = false } = {}) {
  const headers = auth ? getAuthHeaders() : {};
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || 'Upload failed';
      throw new Error(msg);
    }
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Temporarily disabled connection error popup
      console.log('Network error detected, but popup disabled');
      throw new Error('Cannot connect to server. Please check if the backend server is running.');
    }
    throw error;
  }
}

function requireAuth() {
  if (!getToken()) {
    location.href = './login.html';
    return false;
  }
  return true;
}

// Connection error handling
function showConnectionError() {
  // Check if error modal already exists
  if (document.querySelector('.connection-error-modal')) return;
  
  const modal = document.createElement('div');
  modal.className = 'connection-error-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>⚠️ Connection Error</h3>
        </div>
        <div class="modal-body">
          <p><strong>Cannot connect to the server.</strong></p>
          <p>The backend server might not be running. Here's how to fix it:</p>
          <ol>
            <li>Make sure XAMPP is running (Apache + MySQL)</li>
            <li>Run <code>start-linkuiu.bat</code> to start the backend server</li>
            <li>Or run <code>troubleshoot-linkuiu.bat</code> for automated diagnosis</li>
          </ol>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="this.closest('.connection-error-modal').remove()">OK</button>
            <button class="btn btn-secondary" onclick="location.reload()">Retry</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 10000);
}

// Toasts and loading
function showToast(message, type = '') {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

let loadingRefCount = 0;
function setLoading(active) {
  let o = document.querySelector('.loading-overlay');
  if (!o) {
    o = document.createElement('div');
    o.className = 'loading-overlay';
    o.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(o);
  }
  loadingRefCount += active ? 1 : -1;
  if (loadingRefCount < 0) loadingRefCount = 0;
  o.classList.toggle('active', loadingRefCount > 0);
}

// Active page highlighting
function highlightActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const linkPage = href.split('/').pop();
      if (linkPage === currentPage || 
          (currentPage === 'index.html' && linkPage === 'landing.html') ||
          (currentPage === 'landing.html' && linkPage === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

// Standardized navbar structure
function createStandardNavbar(isAuthenticated = false) {
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('auth_user') || '{}') : null;
  const userType = user?.user_type || 'student';
  
  if (isAuthenticated) {
    return `
      <header class="header">
        <div class="header-inner">
          <div class="brand-left">
            <img class="uiu-logo" src="../assets/images/uiu_logo.png?v=2" alt="UIU logo" />
          </div>
          <div class="brand-center"></div>
          <div class="brand-right">
            <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./dashboard.html'" style="cursor: pointer;" />
          </div>
          <nav class="nav">
            <span class="nav-link" onclick="location.href='./dashboard.html'" style="cursor: pointer;">Home</span>
            <span class="nav-link" onclick="location.href='./profile.html'" style="cursor: pointer;">Profile</span>
            <span class="nav-link" onclick="location.href='./jobs.html'" style="cursor: pointer;">Jobs</span>
            <span class="nav-link" onclick="location.href='./applications.html'" style="cursor: pointer;">My Applications</span>
            <span class="nav-link" onclick="location.href='./connections.html'" style="cursor: pointer;">Connections</span>
            <span class="nav-link" onclick="location.href='./messages.html'" style="cursor: pointer;">Messages</span>
            <span class="nav-link" onclick="location.href='./search.html'" style="cursor: pointer;">Search</span>
            <button class="btn btn-primary" onclick="localStorage.clear(); location.href='./login.html'">Logout</button>
          </nav>
        </div>
        
      </header>
    `;
  } else {
    return `
      <header class="header">
        <div class="header-inner">
          <div class="brand-left">
            <img class="uiu-logo" src="../assets/images/uiu_logo.png?v=2" alt="UIU logo" />
          </div>
          <div class="brand-center"></div>
          <div class="brand-right">
            <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./landing.html'" style="cursor: pointer;" />
          </div>
          <nav class="nav">
            <span class="nav-link" id="home-link" style="cursor: pointer;">Home</span>
            <span class="nav-link" onclick="location.href='jobs.html'" style="cursor: pointer;">Jobs</span>
            <span class="nav-link" onclick="location.href='connections.html'" style="cursor: pointer;">Connect</span>
            <span class="nav-link" onclick="location.href='messages.html'" style="cursor: pointer;">Messages</span>
            <span class="nav-link" onclick="location.href='search.html'" style="cursor: pointer;">Directory</span>
            <span class="nav-link" onclick="location.href='profile.html'" style="cursor: pointer;">Profile</span>
            <a href="login.html" class="btn btn-primary">Login</a>
          </nav>
        </div>
        
      </header>
    `;
  }
}

window.LinkUIU = { 
  api, 
  apiMultipart, 
  saveAuth, 
  getToken, 
  requireAuth, 
  showToast, 
  setLoading,
  highlightActivePage,
  createStandardNavbar
};

// Make closeMobileMenu globally available
window.closeMobileMenu = closeMobileMenu;



// Sticky header functionality
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  if (header) {
    let lastScrollY = window.scrollY;
    
    // Ensure header is always visible
    const ensureHeaderVisible = () => {
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.zIndex = '1000';
    };
    
    // Initial setup
    ensureHeaderVisible();
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled class when user scrolls down
      if (currentScrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Ensure header stays sticky
      ensureHeaderVisible();
      
      lastScrollY = currentScrollY;
    });
    
    // Also ensure on resize
    window.addEventListener('resize', ensureHeaderVisible);
  }
});

