<?php
require_once '../includes/session.php';

// Get user data (optional authentication for search)
$user = $current_user;
$is_authenticated = $is_authenticated;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Search - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <style>
    /* Desktop layout for search results */
    @media (min-width: 768px) {
      .search-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .search-form-section {
        position: sticky;
        top: 20px;
        height: fit-content;
      }
      
      .search-results-section {
        min-height: 500px;
      }
      
      .search-results-section h3 {
        margin-bottom: 20px;
        color: var(--color-text);
        font-size: 1.2rem;
      }
    }
    
    /* Mobile layout remains single column */
    @media (max-width: 767px) {
      .search-container {
        display: block;
      }
    }
  </style>
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    // Check if user is authenticated
    const isAuthenticated = <?php echo $is_authenticated ? 'true' : 'false'; ?>;
    
    async function doSearch(e) {
      e && e.preventDefault();
      const tab = document.querySelector('input[name=tab]:checked').value;
      const q = document.getElementById('q').value.trim();
      const location = document.getElementById('location').value.trim();
      const out = document.getElementById('results');
      out.innerHTML = '';
      
      console.log('Searching for:', { tab, q, location });
      
      try {
        if (tab === 'users') {
          console.log('Searching users with query:', q);
          const response = await fetch(`<?php echo $api_base; ?>/search/users?q=${encodeURIComponent(q)}`);
          const u = await response.json();
          console.log('Search results:', u);
          if (!u.length) {
            const empty = document.createElement('div'); empty.className='subtitle'; empty.textContent='No users found'; out.replaceChildren(empty); return;
          }
          for (const x of u) {
            const card = document.createElement('div'); 
            card.className='card';
            card.style.cursor = 'pointer';
            
            const t = document.createElement('div'); 
            t.className='title'; 
            t.textContent = x.name || '';
            
            const s = document.createElement('div'); 
            s.className='subtitle'; 
            s.textContent = `${x.current_job || 'No position'} • ${x.location_city||''} ${x.location_country||''}`.trim();
            
            const skills = document.createElement('div');
            skills.className = 'subtitle';
            skills.textContent = x.skills ? `Skills: ${x.skills.substring(0, 50)}${x.skills.length > 50 ? '...' : ''}` : '';
            
            card.appendChild(t); 
            card.appendChild(s);
            if (skills.textContent) card.appendChild(skills);
            
            // Make card clickable to view profile
            card.addEventListener('click', () => {
              window.open(`./public-profile.php?id=${x.id}`, '_blank');
            });
            
            out.appendChild(card);
          }
        } else {
          // Only allow job search for authenticated users
          if (!isAuthenticated) {
            const err = document.createElement('div'); 
            err.className='error'; 
            err.innerHTML = 'Please <a href="login.php">login</a> to search for jobs.';
            out.replaceChildren(err); 
            return;
          }
          
          const response = await fetch(`<?php echo $api_base; ?>/search/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}`, {
            headers: {
              'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>'
            }
          });
          const j = await response.json();
          if (!j.length) {
            const empty = document.createElement('div'); empty.className='subtitle'; empty.textContent='No jobs found'; out.replaceChildren(empty); return;
          }
          for (const x of j) {
            const card = document.createElement('div'); card.className='card';
            const t = document.createElement('div'); t.className='title'; t.textContent = x.title || '';
            const s = document.createElement('div'); s.className='subtitle'; s.textContent = `${x.company||''} • ${x.location||''}`;
            card.appendChild(t); card.appendChild(s); out.appendChild(card);
          }
        }
      } catch (e) {
        const err = document.createElement('div'); err.className='error'; err.textContent = e.message; out.replaceChildren(err);
      }
    }
    
    function logout() {
      // Clear session data
      fetch('<?php echo $api_base; ?>/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
          'Content-Type': 'application/json'
        }
      }).then(() => {
        // Clear local storage and session
        localStorage.clear();
        // Redirect to login
        location.href = './login.php';
      }).catch(() => {
        // Even if logout fails, clear local data and redirect
        localStorage.clear();
        location.href = './login.php';
      });
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      // Hide job search option for non-authenticated users
      const jobRadio = document.querySelector('input[name=tab][value="jobs"]');
      const jobLabel = jobRadio ? jobRadio.parentElement : null;
      const locationInput = document.getElementById('location');
      
      if (!isAuthenticated) {
        if (jobRadio) jobRadio.style.display = 'none';
        if (jobLabel) jobLabel.style.display = 'none';
        if (locationInput) locationInput.style.display = 'none';
      }
      
      document.getElementById('search-form').addEventListener('submit', doSearch);
      document.querySelectorAll('input[name=tab]').forEach(r=>r.addEventListener('change', doSearch));
    });
  </script>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand-left">
        <img class="uiu-logo" src="../assets/images/uiu_logo.png?v=2" alt="UIU logo" />
      </div>
      <div class="brand-center"></div>
      <div class="brand-right">
        <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='<?php echo $is_authenticated ? './dashboard.php' : './landing.html'; ?>'" style="cursor: pointer;" />
      </div>
      <button class="hamburger" aria-label="Toggle mobile menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav">
        <?php if ($is_authenticated): ?>
          <span class="nav-link" onclick="location.href='./dashboard.php'" style="cursor: pointer;">Home</span>
          <span class="nav-link" onclick="location.href='./profile.php'" style="cursor: pointer;">Profile</span>
          <span class="nav-link" onclick="location.href='./jobs.php'" style="cursor: pointer;">Jobs</span>
          <span class="nav-link" onclick="location.href='./applications.php'" style="cursor: pointer;">My Applications</span>
          <span class="nav-link" onclick="location.href='./connections.php'" style="cursor: pointer;">Connections</span>
          <span class="nav-link" onclick="location.href='./messages.php'" style="cursor: pointer;">Messages</span>
          <span class="nav-link" onclick="location.href='./search.php'" style="cursor: pointer;">Search</span>
          <button class="btn btn-primary" onclick="logout()">Logout</button>
        <?php else: ?>
          <span class="nav-link" onclick="location.href='./landing.html'" style="cursor: pointer;">Home</span>
          <span class="nav-link" onclick="location.href='./jobs.php'" style="cursor: pointer;">Jobs</span>
          <span class="nav-link" onclick="location.href='./connections.php'" style="cursor: pointer;">Connect</span>
          <span class="nav-link" onclick="location.href='./messages.php'" style="cursor: pointer;">Messages</span>
          <span class="nav-link" onclick="location.href='./search.php'" style="cursor: pointer;">Directory</span>
          <span class="nav-link" onclick="location.href='./profile.php'" style="cursor: pointer;">Profile</span>
          <a href="./login.php" class="btn btn-primary">Login</a>
        <?php endif; ?>
      </nav>
    </div>
    
    <!-- Mobile Navigation -->
    <div class="mobile-nav">
      <div class="mobile-nav-content">
        <div class="mobile-nav-header">
          <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" style="height: 30px;" />
          <button class="mobile-nav-close" aria-label="Close mobile menu">&times;</button>
        </div>
        <div class="mobile-nav-links">
          <?php if ($is_authenticated): ?>
            <span onclick="location.href='./dashboard.php'; closeMobileMenu();" style="cursor: pointer;">Home</span>
            <span onclick="location.href='./profile.php'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
            <span onclick="location.href='./jobs.php'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
            <span onclick="location.href='./applications.php'; closeMobileMenu();" style="cursor: pointer;">My Applications</span>
            <span onclick="location.href='./connections.php'; closeMobileMenu();" style="cursor: pointer;">Connections</span>
            <span onclick="location.href='./messages.php'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
            <span onclick="location.href='./search.php'; closeMobileMenu();" style="cursor: pointer;">Search</span>
            <button class="btn btn-primary" onclick="logout(); closeMobileMenu();">Logout</button>
          <?php else: ?>
            <span onclick="location.href='./landing.html'; closeMobileMenu();" style="cursor: pointer;">Home</span>
            <span onclick="location.href='./jobs.php'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
            <span onclick="location.href='./connections.php'; closeMobileMenu();" style="cursor: pointer;">Connect</span>
            <span onclick="location.href='./messages.php'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
            <span onclick="location.href='./search.php'; closeMobileMenu();" style="cursor: pointer;">Directory</span>
            <span onclick="location.href='./profile.php'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
            <a href="./login.php" class="btn btn-primary">Login</a>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </header>
  <div class="search-container">
    <div class="search-form-section">
      <div class="card">
        <h3>Search Directory</h3>
        <form id="search-form">
          <input id="q" class="input" placeholder="Search by name, skills, or ID..." />
          <input id="location" class="input" placeholder="Location (for jobs)" />
          <div class="row">
            <label class="row"><input type="radio" name="tab" value="users" checked />&nbsp;Users</label>
            <label class="row"><input type="radio" name="tab" value="jobs" />&nbsp;Jobs</label>
          </div>
          <button class="btn btn-primary">Search</button>
        </form>
      </div>
    </div>
    
    <div class="search-results-section">
      <h3>Search Results</h3>
      <div id="results" style="display:grid; gap:16px;"></div>
    </div>
  </div>
</body>
</html>
