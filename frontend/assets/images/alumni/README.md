# Featured Alumni Images

This folder contains images for featured alumni displayed on the landing page.

## Folder Structure
```
frontend/assets/images/alumni/
├── featured/           # Featured alumni images
│   ├── sarah-ahmed.jpg
│   ├── rahman-khan.jpg
│   ├── fatima-begum.jpg
│   ├── ahmed-hassan.jpg
│   ├── nusrat-jahan.jpg
│   └── karim-uddin.jpg
└── README.md          # This file
```

## Image Requirements
- **Format**: JPG or PNG
- **Size**: 400x400 pixels (square aspect ratio)
- **Quality**: High resolution, professional headshots
- **File naming**: Use lowercase with hyphens (e.g., `firstname-lastname.jpg`)

## How to Add New Alumni Images

1. **Prepare the image**:
   - Crop to square aspect ratio (1:1)
   - Resize to 400x400 pixels
   - Save as JPG or PNG

2. **Name the file**:
   - Use format: `firstname-lastname.jpg`
   - Example: `john-doe.jpg`

3. **Place in folder**:
   - Put the image in `frontend/assets/images/alumni/featured/`

4. **Update data**:
   - Add the alumni information to `frontend/assets/data/featured-alumni.json`
   - Set `"image": "filename.jpg"` in the JSON

## Current Featured Alumni
- Dr. Sarah Ahmed (sarah-ahmed.jpg)
- Md. Rahman Khan (rahman-khan.jpg)
- Fatima Begum (fatima-begum.jpg)
- Ahmed Hassan (ahmed-hassan.jpg)
- Nusrat Jahan (nusrat-jahan.jpg)
- Karim Uddin (karim-uddin.jpg)

## Adding Images via Chat
You can send me the images and I'll help you:
1. Optimize them for web display
2. Resize them to the correct dimensions
3. Place them in the correct folder
4. Update the JSON data file
