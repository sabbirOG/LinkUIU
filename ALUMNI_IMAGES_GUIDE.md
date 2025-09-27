# 🎓 Featured Alumni Images Setup Guide

## 📁 Folder Structure Created

```
frontend/assets/
├── images/alumni/
│   ├── featured/              # Featured alumni images go here
│   └── README.md             # Image requirements and guidelines
├── data/
│   ├── featured-alumni.json  # Alumni data (names, companies, etc.)
│   └── README.md             # Data management guide
└── scripts/
    └── image-helper.js       # Image processing utilities
```

## 🖼️ How to Add Alumni Images

### Method 1: Direct File Upload
1. **Prepare your image**:
   - Crop to square aspect ratio (1:1)
   - Resize to 400x400 pixels
   - Save as JPG format

2. **Name the file**:
   - Use format: `firstname-lastname.jpg`
   - Example: `sarah-ahmed.jpg`

3. **Place in folder**:
   - Put the image in `frontend/assets/images/alumni/featured/`

4. **Update the JSON data**:
   - Edit `frontend/assets/data/featured-alumni.json`
   - Make sure the `"image"` field matches your filename

### Method 2: Send Images to AI Assistant
You can send me the images and I'll help you:
- ✅ Optimize them for web display
- ✅ Resize them to 400x400 pixels
- ✅ Convert them to the right format
- ✅ Place them in the correct folder
- ✅ Update the JSON data file

## 📋 Current Alumni Data

The system is now set up with 6 featured alumni:

1. **Dr. Sarah Ahmed** - Senior Software Engineer at Google (Batch 2015)
2. **Md. Rahman Khan** - Data Science Manager at Microsoft (Batch 2018)
3. **Fatima Begum** - Product Manager at Amazon (Batch 2016)
4. **Ahmed Hassan** - UX Design Lead at Meta (Batch 2019)
5. **Nusrat Jahan** - DevOps Engineer at Netflix (Batch 2017)
6. **Karim Uddin** - Business Analyst at Tesla (Batch 2020)

## 🔄 How the System Works

1. **Priority Order**:
   - First tries to load from your backend API
   - Falls back to local JSON data if API fails
   - Shows default avatars if images are missing

2. **Image Loading**:
   - Looks for images in `frontend/assets/images/alumni/featured/`
   - Shows default avatar with initials if image is missing
   - Gracefully handles missing images

3. **Data Structure**:
   - Each alumni has: name, profession, company, batch, degree, image, LinkedIn, achievements, location
   - Images are referenced by filename in the JSON

## 🎨 Image Requirements

- **Format**: JPG or PNG
- **Size**: 400x400 pixels (square)
- **Quality**: High resolution, professional headshots
- **Naming**: Lowercase with hyphens (e.g., `john-doe.jpg`)

## 🚀 Next Steps

1. **Add your alumni images** to `frontend/assets/images/alumni/featured/`
2. **Update the JSON data** in `frontend/assets/data/featured-alumni.json`
3. **Test the landing page** to see the real alumni cards
4. **Customize the data** as needed (companies, achievements, etc.)

## 💡 Pro Tips

- Use professional headshots for better visual appeal
- Keep image file sizes under 500KB for faster loading
- Test the landing page after adding each image
- The system will automatically show default avatars for missing images

## 🔧 Troubleshooting

- **Images not showing?** Check the filename matches the JSON data
- **Wrong image size?** Use the image helper script to resize
- **JSON errors?** Validate your JSON syntax
- **Still showing mock data?** Clear your browser cache

---

**Ready to add your alumni images?** Just send them to me or follow the direct upload method above! 🎉
