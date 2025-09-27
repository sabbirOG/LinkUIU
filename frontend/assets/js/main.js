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

// Initialize animations and navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initPageAnimations();
  highlightActivePage();
  
  // Add home link functionality
  const homeLink = document.getElementById('home-link');
  const mobileHomeLink = document.getElementById('mobile-home-link');
  
  if (homeLink) {
    homeLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    });
  }
  
  if (mobileHomeLink) {
    mobileHomeLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMobileMenu();
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
  const navLinks = document.querySelectorAll('.nav a, .mobile-nav a');
  
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
            <a href="./dashboard.html">Home</a>
            <a href="./profile.html">Profile</a>
            <a href="./jobs.html">Jobs</a>
            <a href="./applications.html">My Applications</a>
            <a href="./connections.html">Connections</a>
            <a href="./messages.html">Messages</a>
            <a href="./search.html">Search</a>
            <button class="btn btn-primary" onclick="localStorage.clear(); location.href='./login.html'">Logout</button>
          </nav>
          <button class="hamburger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        <!-- Mobile Navigation -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay" onclick="closeMobileMenu()"></div>
        <nav class="mobile-nav" id="mobileNav">
          <a href="./dashboard.html">Home</a>
          <a href="./profile.html">Profile</a>
          <a href="./jobs.html">Jobs</a>
          <a href="./applications.html">My Applications</a>
          <a href="./connections.html">Connections</a>
          <a href="./messages.html">Messages</a>
          <a href="./search.html">Search</a>
          <button class="btn btn-primary" onclick="localStorage.clear(); location.href='./login.html'">Logout</button>
        </nav>
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
            <a href="jobs.html">Jobs</a>
            <a href="connections.html">Connect</a>
            <a href="messages.html">Messages</a>
            <a href="search.html">Directory</a>
            <a href="profile.html">Profile</a>
            <a href="login.html" class="btn btn-primary">Login</a>
          </nav>
          <button class="hamburger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        <!-- Mobile Navigation -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay" onclick="closeMobileMenu()"></div>
        <nav class="mobile-nav" id="mobileNav">
          <span class="nav-link" id="mobile-home-link" style="cursor: pointer;">Home</span>
          <a href="jobs.html">Jobs</a>
          <a href="connections.html">Connect</a>
          <a href="messages.html">Messages</a>
          <a href="search.html">Directory</a>
          <a href="profile.html">Profile</a>
          <a href="login.html" class="btn btn-primary">Login</a>
        </nav>
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
  toggleMobileMenu,
  closeMobileMenu,
  highlightActivePage,
  createStandardNavbar
};

// Mobile menu toggle functionality
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');
  
  if (hamburger && mobileNav && mobileOverlay) {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }
}

function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');
  
  if (hamburger && mobileNav && mobileOverlay) {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
}

// Mobile menu event listeners
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.hamburger');
  if (btn) {
    toggleMobileMenu();
    return;
  }
  
  const navLink = e.target.closest('.nav a, .nav .btn, .mobile-nav a, .mobile-nav .btn');
  if (navLink && document.body.classList.contains('menu-open')) {
    closeMobileMenu();
  }
  
  // Close menu when clicking overlay
  if (e.target.classList.contains('mobile-menu-overlay')) {
    closeMobileMenu();
  }
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
    closeMobileMenu();
  }
});

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

