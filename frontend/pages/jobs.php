<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Get user data
$user = $current_user;
$user_type = $user['user_type'] ?? 'student';

// Handle form submission
$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'create_job') {
        try {
            $jobData = [
                'title' => trim($_POST['title'] ?? ''),
                'company' => trim($_POST['company'] ?? ''),
                'location' => trim($_POST['location'] ?? ''),
                'description' => trim($_POST['description'] ?? '')
            ];
            
            $result = makeApiCall('/jobs', 'POST', $jobData, true);
            $success_message = 'Job posted successfully!';
            
        } catch (Exception $e) {
            $error_message = $e->getMessage();
        }
    }
}

// Fetch jobs from backend
$jobs = [];
try {
    $jobs = makeApiCall('/jobs?limit=20&offset=0', 'GET', null, false);
} catch (Exception $e) {
    error_log('Failed to fetch jobs: ' . $e->getMessage());
}

// Fetch user's applications if they're a student
$user_applications = [];
if ($user_type === 'student') {
    try {
        $applications = makeApiCall('/applications/student/' . $user['id'], 'GET', null, true);
        $user_applications = array_column($applications, 'job_id');
    } catch (Exception $e) {
        error_log('Failed to fetch applications: ' . $e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Jobs - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    let userApplications = new Set(<?php echo json_encode($user_applications); ?>);
    let userType = '<?php echo $user_type; ?>';
    let currentUser = <?php echo json_encode($user); ?>;

    async function loadJobs() {
      const list = document.getElementById('list');
      list.innerHTML = '';
      try {
        const jobs = <?php echo json_encode($jobs); ?>;
        
        if (!jobs.length) {
          const empty = document.createElement('div');
          empty.className = 'subtitle';
          empty.textContent = 'No jobs yet';
          list.replaceChildren(empty);
          return;
        }
        
        for (const j of jobs) {
          const card = document.createElement('div');
          card.className = 'card';
          const t = document.createElement('div'); t.className='title'; t.textContent = j.title || '';
          const s = document.createElement('div'); s.className='subtitle'; s.textContent = `${j.company || ''} • ${j.location || ''}`;
          
          // Add description if available
          if (j.description) {
            const desc = document.createElement('div');
            desc.className = 'description';
            desc.textContent = j.description.length > 100 ? j.description.substring(0, 100) + '...' : j.description;
            card.appendChild(desc);
          }
          
          card.appendChild(t); card.appendChild(s);

          // Add action buttons
          const actions = document.createElement('div');
          actions.className = 'card-actions';

          if (currentUser && currentUser.id && j.posted_by === currentUser.id) {
            // Job poster actions
            const btn = document.createElement('button');
            btn.className = 'kebab-btn';
            btn.title = 'Actions';
            btn.textContent = '⋮';
            const menu = document.createElement('div');
            menu.className = 'kebab-menu';
            
            const viewApps = document.createElement('button');
            viewApps.textContent = 'View Applications';
            viewApps.addEventListener('click', () => viewApplications(j.id));
            
            const edit = document.createElement('button');
            edit.textContent = 'Edit job';
            edit.addEventListener('click', () => openEdit(j));
            
            const del = document.createElement('button');
            del.textContent = 'Delete job';
            del.addEventListener('click', () => deleteJob(j.id));
            
            menu.appendChild(viewApps);
            menu.appendChild(edit);
            menu.appendChild(del);
            
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              menu.classList.toggle('open');
            });
            document.addEventListener('click', () => menu.classList.remove('open'));
            actions.appendChild(btn);
            actions.appendChild(menu);
          } else if (currentUser && currentUser.id && j.posted_by !== currentUser.id) {
            // Student actions
            const applyBtn = document.createElement('button');
            applyBtn.className = 'btn btn-primary';
            
            if (userApplications.has(j.id)) {
              applyBtn.textContent = 'Applied ✓';
              applyBtn.disabled = true;
              applyBtn.style.opacity = '0.7';
            } else {
              applyBtn.textContent = 'Apply';
              applyBtn.addEventListener('click', () => openApplicationModal(j));
            }
            
            actions.appendChild(applyBtn);
          }

          card.appendChild(actions);
          list.appendChild(card);
        }
      } catch (e) {
        const err = document.createElement('div');
        err.className = 'error';
        err.textContent = e.message;
        list.replaceChildren(err);
      }
    }

    async function submitJob(e) {
      e.preventDefault();
      const err = document.getElementById('error');
      err.textContent = '';
      try {
        const formData = new FormData(e.target);
        const jobData = {
          title: formData.get('title').trim(),
          company: formData.get('company').trim(),
          location: formData.get('location').trim(),
          description: formData.get('description').trim()
        };
        
        const response = await fetch('<?php echo $api_base; ?>/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: JSON.stringify(jobData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create job');
        }
        
        e.target.reset();
        loadJobs();
        location.reload(); // Reload to show new job
      } catch (e) { 
        err.textContent = e.message; 
      }
    }

    async function deleteJob(id) {
      if (!confirm('Delete this job?')) return;
      try { 
        const response = await fetch(`<?php echo $api_base; ?>/jobs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete job');
        }
        
        loadJobs(); 
      }
      catch(e) { alert(e.message); }
    }

    function openEdit(job) {
      const title = prompt('Title', job.title);
      if (title === null) return;
      const company = prompt('Company', job.company||'');
      if (company === null) return;
      const location = prompt('Location', job.location||'');
      
      fetch(`<?php echo $api_base; ?>/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
          'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
        },
        body: JSON.stringify({ title, company, location })
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update job');
          loadJobs();
        })
        .catch(e => alert(e.message));
    }

    function openApplicationModal(job) {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>Apply for ${job.title}</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body">
            <form id="application-form">
              <div class="field">
                <label class="label">Cover Letter</label>
                <textarea id="cover-letter" class="input" rows="4" placeholder="Tell us why you're interested in this position..."></textarea>
              </div>
              <div class="field">
                <label class="label">Resume URL (optional)</label>
                <input id="resume-url" class="input" type="url" placeholder="https://example.com/resume.pdf" />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Application</button>
              </div>
              <div id="application-error" class="error"></div>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Handle form submission
      modal.querySelector('#application-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = modal.querySelector('#application-error');
        errorDiv.textContent = '';
        
        try {
          const coverLetter = modal.querySelector('#cover-letter').value.trim();
          const resumeUrl = modal.querySelector('#resume-url').value.trim();
          
          const response = await fetch('<?php echo $api_base; ?>/applications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
              'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
            },
            body: JSON.stringify({
              job_id: job.id,
              cover_letter: coverLetter || null,
              resume: resumeUrl || null
            })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit application');
          }
          
          modal.remove();
          loadJobs(); // Refresh to show "Applied" status
          alert('Application submitted successfully!');
        } catch (e) {
          errorDiv.textContent = e.message;
        }
      });
    }

    async function viewApplications(jobId) {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>Job Applications</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
          </div>
          <div class="modal-body">
            <div id="applications-list">Loading applications...</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      try {
        const response = await fetch(`<?php echo $api_base; ?>/applications/job/${jobId}`, {
          headers: {
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load applications');
        }
        
        const applications = await response.json();
        const list = modal.querySelector('#applications-list');
        
        if (!applications.length) {
          list.innerHTML = '<div class="subtitle">No applications yet</div>';
          return;
        }
        
        list.innerHTML = '';
        for (const app of applications) {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <div class="title">${app.student_name || 'Unknown Student'}</div>
            <div class="subtitle">Student ID: ${app.student_id || 'N/A'}</div>
            <div class="subtitle">Applied: ${new Date(app.applied_at).toLocaleDateString()}</div>
            <div class="subtitle">Status: <span class="status-${app.status}">${app.status}</span></div>
            ${app.cover_letter ? `<div class="description"><strong>Cover Letter:</strong><br>${app.cover_letter}</div>` : ''}
            ${app.resume ? `<div class="subtitle"><strong>Resume:</strong> <a href="${app.resume}" target="_blank">View Resume</a></div>` : ''}
          `;
          list.appendChild(card);
        }
      } catch (e) {
        modal.querySelector('#applications-list').innerHTML = `<div class="error">Error loading applications: ${e.message}</div>`;
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
      loadJobs();
      document.getElementById('job-form').addEventListener('submit', submitJob);
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
        <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./dashboard.php'" style="cursor: pointer;" />
      </div>
      <button class="hamburger" aria-label="Toggle mobile menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav">
        <span class="nav-link" onclick="location.href='./dashboard.php'" style="cursor: pointer;">Home</span>
        <span class="nav-link" onclick="location.href='./profile.php'" style="cursor: pointer;">Profile</span>
        <span class="nav-link" onclick="location.href='./jobs.php'" style="cursor: pointer;">Jobs</span>
        <span class="nav-link" onclick="location.href='./applications.php'" style="cursor: pointer;">My Applications</span>
        <span class="nav-link" onclick="location.href='./connections.php'" style="cursor: pointer;">Connections</span>
        <span class="nav-link" onclick="location.href='./messages.php'" style="cursor: pointer;">Messages</span>
        <span class="nav-link" onclick="location.href='./search.php'" style="cursor: pointer;">Search</span>
        <button class="btn btn-primary" onclick="logout()">Logout</button>
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
          <span onclick="location.href='./dashboard.php'; closeMobileMenu();" style="cursor: pointer;">Home</span>
          <span onclick="location.href='./profile.php'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
          <span onclick="location.href='./jobs.php'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
          <span onclick="location.href='./applications.php'; closeMobileMenu();" style="cursor: pointer;">My Applications</span>
          <span onclick="location.href='./connections.php'; closeMobileMenu();" style="cursor: pointer;">Connections</span>
          <span onclick="location.href='./messages.php'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
          <span onclick="location.href='./search.php'; closeMobileMenu();" style="cursor: pointer;">Search</span>
          <button class="btn btn-primary" onclick="logout(); closeMobileMenu();">Logout</button>
        </div>
      </div>
    </div>
  </header>
  <div class="container">
    <div class="card mt-24">
      <form id="job-form" method="POST" action="">
        <input type="hidden" name="action" value="create_job">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
        
        <?php if ($error_message): ?>
          <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <?php if ($success_message): ?>
          <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <div class="field"><label class="label">Title</label><input id="title" name="title" class="input" required /></div>
        <div class="field"><label class="label">Company</label><input id="company" name="company" class="input" required /></div>
        <div class="field"><label class="label">Location</label><input id="location" name="location" class="input" /></div>
        <div class="field"><label class="label">Description</label><textarea id="description" name="description" class="input" rows="4" placeholder="Describe the job requirements, responsibilities, and benefits..."></textarea></div>
        <button class="btn btn-primary" type="submit">Post Job</button>
        <div id="error" class="error"></div>
      </form>
    </div>
    <div id="list" class="mt-24" style="display:grid; gap:16px;"></div>
  </div>
</body>
</html>
