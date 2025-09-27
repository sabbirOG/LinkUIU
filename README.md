# LinkUIU - UIU Alumni Network

A comprehensive alumni networking platform for United International University (UIU) students and graduates.

## Quick Start

### GitHub Setup
1. Create a new repository on GitHub (don't initialize with README)
2. Run: `push-to-github.bat` and enter your GitHub repository URL
3. Done! Your code is now on GitHub

### Local Development
Backend: PHP (PDO MySQL)

Setup
- Import schema
  - mysql -h localhost -u root -p < database/schema.sql
- Seed sample data
  - mysql -h localhost -u root -p link_uiu_db < database/seed.sql
- Run backend
  - php -S localhost:8000 -t backend backend/index.php

Notes
- batch_id may be NULL (ON DELETE SET NULL). Handle in UI/API by treating missing batch as "Not specified".
- Passwords: Always use PHP password_hash() and password_verify(). The seed uses placeholder bcrypt hashes for dev only.
- Search: users.skills has a prefix index (50). For advanced search later, you can enable a FULLTEXT index:
  - ALTER TABLE users ADD FULLTEXT INDEX fulltext_users_skills (skills);

Deployment
- Set environment variables (or .env):
  - APP_ENV=production
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
  - ALLOWED_ORIGINS=https://yourdomain.com
- Serve via nginx/Apache using examples in deploy/nginx.conf or deploy/apache.conf
- For frontend pages in production, add before main.js:
  - <script>window.APP_API_BASE='https://api.yourdomain.com';</script>


