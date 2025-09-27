# 🎓 LinkUIU - UIU Alumni Network

> **Connect. Collaborate. Grow.** A modern networking platform for United International University students and alumni.

[![PHP](https://img.shields.io/badge/PHP-8.0+-blue.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

- 🔐 **Secure Authentication** - Student & Alumni login with session management
- 👥 **Smart Connections** - Find and connect with fellow UIU members
- 💼 **Job Board** - Browse opportunities posted by alumni
- 📧 **Messaging System** - Direct communication between users
- 🔍 **Advanced Search** - Find people by skills, department, batch, or location
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, intuitive interface

## 🚀 Quick Start

### Prerequisites
- PHP 8.0+ with PDO MySQL extension
- MySQL 8.0+
- Web server (Apache/Nginx) or PHP built-in server

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/LinkUIU.git
cd LinkUIU
```

### 2. Database Setup
```bash
# Create database and import schema
mysql -h localhost -u root -p < database/schema.sql

# Add sample data (optional)
mysql -h localhost -u root -p link_uiu_db < database/seed.sql
```

### 3. Run Development Server
```bash
# Windows
start-server.bat

# Or manually
php -S localhost:8000 -t backend backend/index.php
```

### 4. Access Application
- **Frontend**: http://localhost/LinkUIU/frontend/pages/login.html
- **API**: http://localhost:8000

## 🏗️ Project Structure

```
LinkUIU/
├── 📁 backend/           # PHP API server
│   ├── 📁 controllers/   # API endpoints
│   ├── 📁 models/        # Database models
│   ├── 📁 routes/        # Route definitions
│   └── 📁 config/        # Database configuration
├── 📁 frontend/          # Web interface
│   ├── 📁 pages/         # HTML pages
│   ├── 📁 assets/        # CSS, JS, images
│   └── 📁 components/    # Reusable UI components
├── 📁 database/          # SQL schemas & seeds
└── 📁 deploy/            # Production configs
```

## 🔧 Configuration

### Database Settings
Edit `backend/config/db.php`:
```php
$host = 'localhost';
$dbname = 'link_uiu_db';
$username = 'your_username';
$password = 'your_password';
```

### Environment Variables
For production, set these environment variables:
```bash
APP_ENV=production
DB_HOST=your_db_host
DB_NAME=link_uiu_db
DB_USER=your_db_user
DB_PASS=your_db_password
ALLOWED_ORIGINS=https://yourdomain.com
```

## 📊 Database Schema

### Core Tables
- **users** - Student & alumni profiles
- **departments** - UIU departments
- **batches** - Academic batches/trimesters
- **connections** - User connections/friendships
- **jobs** - Job postings
- **messages** - Direct messages
- **sessions** - Authentication tokens

### Key Features
- 🔒 **Secure passwords** using PHP `password_hash()`
- 🔍 **Search optimization** with indexed skills field
- 🌐 **Flexible batch handling** (NULL batches supported)
- 📱 **Mobile-responsive** design

## 🚀 Deployment

### Apache Setup
```apache
# Use deploy/apache.conf as reference
DocumentRoot /var/www/LinkUIU
```

### Nginx Setup
```nginx
# Use deploy/nginx.conf as reference
server {
    root /var/www/LinkUIU;
    index index.html;
}
```

### Production Checklist
- [ ] Set `APP_ENV=production`
- [ ] Configure database credentials
- [ ] Set up SSL certificates
- [ ] Update `ALLOWED_ORIGINS`
- [ ] Configure web server
- [ ] Test all functionality

## 🛠️ Development

### API Endpoints
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /search/users` - Search users
- `POST /connections/request` - Send connection request
- `GET /jobs` - List job postings
- `POST /messages/send` - Send message

### Frontend Pages
- `/login.html` - Authentication
- `/dashboard.html` - User dashboard
- `/search.html` - User directory
- `/jobs.html` - Job listings
- `/connections.html` - Network management
- `/messages.html` - Messaging interface

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- United International University for inspiration
- UIU Alumni community for feedback
- Open source contributors

---

**Made with ❤️ for the UIU community**


