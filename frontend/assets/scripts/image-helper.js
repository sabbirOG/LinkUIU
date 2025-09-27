// Image Helper Script for Alumni Management
// This script helps optimize and resize images for alumni profiles

class ImageHelper {
    static async processAlumniImage(file, name) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Set canvas size to 400x400 (square)
                canvas.width = 400;
                canvas.height = 400;
                
                // Calculate crop dimensions to maintain aspect ratio
                const size = Math.min(img.width, img.height);
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;
                
                // Draw cropped and resized image
                ctx.drawImage(img, x, y, size, size, 0, 0, 400, 400);
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Create filename
                        const filename = name.toLowerCase().replace(/\s+/g, '-') + '.jpg';
                        resolve({ blob, filename });
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                }, 'image/jpeg', 0.9);
            };
            
            img.onerror = () => reject(new Error('Invalid image file'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    static downloadImage(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    static validateImage(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
            throw new Error('Please upload a JPG or PNG image');
        }
        
        if (file.size > maxSize) {
            throw new Error('Image size must be less than 5MB');
        }
        
        return true;
    }
}

// Usage example for image upload
function setupImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png';
    
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            ImageHelper.validateImage(file);
            const { blob, filename } = await ImageHelper.processAlumniImage(file, 'alumni-name');
            ImageHelper.downloadImage(blob, filename);
            console.log('Processed image:', filename);
        } catch (error) {
            alert('Error processing image: ' + error.message);
        }
    });
    
    return input;
}

// Make available globally
window.ImageHelper = ImageHelper;
window.setupImageUpload = setupImageUpload;
