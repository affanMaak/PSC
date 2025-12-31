/**
 * Native Splash Screen Image Generator
 * Converts intro.jpeg to PNG and places it in Android drawable folder
 * 
 * Prerequisites: npm install sharp
 * Run: node generate-splash-image.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = path.join(__dirname, 'assets', 'intro.jpeg');
const outputPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'drawable', 'splash_image.png');

async function generateSplashImage() {
    console.log('🎨 Generating native splash screen image...\n');

    // Check if input image exists
    if (!fs.existsSync(inputImage)) {
        console.error('❌ Error: intro.jpeg not found in assets folder!');
        return;
    }

    try {
        // Get image metadata to determine size
        const metadata = await sharp(inputImage).metadata();
        console.log(`📐 Original image size: ${metadata.width}x${metadata.height}`);

        // Create a high-quality splash image
        // We'll resize to a reasonable size that looks good on most devices
        const targetWidth = 1080; // Good for most Android devices

        await sharp(inputImage)
            .resize(targetWidth, null, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .png({
                quality: 100,
                compressionLevel: 6,
            })
            .toFile(outputPath);

        console.log(`✅ Generated splash_image.png`);
        console.log(`📍 Location: ${outputPath}`);
        console.log(`\n✨ Success! Native splash screen image created!`);
        console.log('\n📋 Next steps:');
        console.log('  1. Clean your build: cd android && ./gradlew clean && cd ..');
        console.log('  2. Rebuild your app: npx react-native run-android');
        console.log('  3. The splash screen will now show immediately!\n');

    } catch (error) {
        console.error('❌ Error generating splash image:', error.message);
        console.error(error);
    }
}

// Run the script
generateSplashImage();
