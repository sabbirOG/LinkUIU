# LinkUIU Cleanup Log

### Cleanup Date: 2026-04-23

### Legacy Files Decommissioned
As part of the final transition to the Next.js (`v2`) architecture and Supabase, the following legacy components were safely removed:

**Backend & Legacy App Components:**
- ✅ `backend/` - Legacy PHP backend codebase
- ✅ `frontend/` - Legacy HTML/CSS/JS frontend
- ✅ `storage/` - Legacy local PHP file storage (replaced by Supabase Storage)

**Deployment & Server Configs:**
- ✅ `deploy/` - Apache & Nginx configs for PHP (Next.js is on Vercel)
- ✅ `start-server.bat` - Legacy local PHP server script
- ✅ `index.html` (root) - Legacy redirect to old frontend

**Folders Kept:**
- `v2/` - The new, modern Next.js 14 architecture.
- `database/` - Preserved SQL schemas (useful for reference and Supabase migrations).

### Space Saved
- **Maintenance:** Clean, streamlined repository containing only the active v2 app and database schemas.
