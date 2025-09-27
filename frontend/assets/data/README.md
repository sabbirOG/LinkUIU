# Alumni Data Management

This folder contains JSON data files for managing alumni information.

## Files
- `featured-alumni.json` - Contains featured alumni data displayed on the landing page

## Data Structure
Each alumni entry includes:
- `id`: Unique identifier
- `name`: Full name
- `profession`: Job title
- `company`: Current company
- `batch`: Graduation year
- `degree`: Degree obtained
- `image`: Image filename (stored in `/images/alumni/featured/`)
- `linkedin`: LinkedIn profile URL
- `achievements`: Notable achievements
- `location`: Current location
- `featured`: Boolean flag for featured display

## How to Update Alumni Data

1. **Edit the JSON file** directly
2. **Add new alumni** by copying an existing entry and modifying the fields
3. **Update existing alumni** by modifying their information
4. **Remove alumni** by deleting their entry (or set `"featured": false`)

## Image Management
- Images are stored in `/images/alumni/featured/`
- Image filenames should match the `"image"` field in the JSON
- Use descriptive, lowercase filenames with hyphens
