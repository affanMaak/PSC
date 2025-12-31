/**
 * App Icon Generator Script
 * This script converts your logo.jpeg to PNG format and generates
 * all required icon sizes for Android and iOS
 * 
 * Prerequisites: Install sharp library
 * Run: npm install sharp
 * Then: node generate-app-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes for Android
const androidSizes = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Icon sizes for iOS
const iosSizes = [
    { name: 'AppIcon-20x20@1x.png', size: 20 },
    { name: 'AppIcon-20x20@2x.png', size: 40 },
    { name: 'AppIcon-20x20@3x.png', size: 60 },
    { name: 'AppIcon-29x29@1x.png', size: 29 },
    { name: 'AppIcon-29x29@2x.png', size: 58 },
    { name: 'AppIcon-29x29@3x.png', size: 87 },
    { name: 'AppIcon-40x40@1x.png', size: 40 },
    { name: 'AppIcon-40x40@2x.png', size: 80 },
    { name: 'AppIcon-40x40@3x.png', size: 120 },
    { name: 'AppIcon-60x60@2x.png', size: 120 },
    { name: 'AppIcon-60x60@3x.png', size: 180 },
    { name: 'AppIcon-76x76@1x.png', size: 76 },
    { name: 'AppIcon-76x76@2x.png', size: 152 },
    { name: 'AppIcon-83.5x83.5@2x.png', size: 167 },
    { name: 'AppIcon-1024x1024@1x.png', size: 1024 },
];

const inputImage = path.join(__dirname, 'assets', 'logo.jpeg');
const androidBasePath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const iosBasePath = path.join(__dirname, 'ios', 'PSC1', 'Images.xcassets', 'AppIcon.appiconset');

async function generateIcons() {
    console.log('🚀 Starting app icon generation...\n');

    // Check if input image exists
    if (!fs.existsSync(inputImage)) {
        console.error('❌ Error: logo.jpeg not found in assets folder!');
        return;
    }

    try {
        // Generate Android icons
        console.log('📱 Generating Android icons...');
        for (const { folder, size } of androidSizes) {
            const outputDir = path.join(androidBasePath, folder);

            // Create directory if it doesn't exist
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const outputPath = path.join(outputDir, 'ic_launcher.png');

            await sharp(inputImage)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center',
                })
                .png()
                .toFile(outputPath);

            console.log(`  ✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
        }

        // Generate round icons for Android (adaptive icons)
        console.log('\n📱 Generating Android round icons...');
        for (const { folder, size } of androidSizes) {
            const outputDir = path.join(androidBasePath, folder);
            const outputPath = path.join(outputDir, 'ic_launcher_round.png');

            await sharp(inputImage)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center',
                })
                .png()
                .toFile(outputPath);

            console.log(`  ✅ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
        }

        // Generate iOS icons
        console.log('\n🍎 Generating iOS icons...');

        // Create iOS directory if it doesn't exist
        if (!fs.existsSync(iosBasePath)) {
            console.log('  ℹ️  iOS AppIcon directory not found, creating it...');
            fs.mkdirSync(iosBasePath, { recursive: true });
        }

        for (const { name, size } of iosSizes) {
            const outputPath = path.join(iosBasePath, name);

            await sharp(inputImage)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center',
                })
                .png()
                .toFile(outputPath);

            console.log(`  ✅ Generated ${name} (${size}x${size})`);
        }

        // Generate Contents.json for iOS
        console.log('\n📝 Generating iOS Contents.json...');
        const contentsJson = {
            images: [
                { size: '20x20', idiom: 'iphone', filename: 'AppIcon-20x20@2x.png', scale: '2x' },
                { size: '20x20', idiom: 'iphone', filename: 'AppIcon-20x20@3x.png', scale: '3x' },
                { size: '29x29', idiom: 'iphone', filename: 'AppIcon-29x29@2x.png', scale: '2x' },
                { size: '29x29', idiom: 'iphone', filename: 'AppIcon-29x29@3x.png', scale: '3x' },
                { size: '40x40', idiom: 'iphone', filename: 'AppIcon-40x40@2x.png', scale: '2x' },
                { size: '40x40', idiom: 'iphone', filename: 'AppIcon-40x40@3x.png', scale: '3x' },
                { size: '60x60', idiom: 'iphone', filename: 'AppIcon-60x60@2x.png', scale: '2x' },
                { size: '60x60', idiom: 'iphone', filename: 'AppIcon-60x60@3x.png', scale: '3x' },
                { size: '20x20', idiom: 'ipad', filename: 'AppIcon-20x20@1x.png', scale: '1x' },
                { size: '20x20', idiom: 'ipad', filename: 'AppIcon-20x20@2x.png', scale: '2x' },
                { size: '29x29', idiom: 'ipad', filename: 'AppIcon-29x29@1x.png', scale: '1x' },
                { size: '29x29', idiom: 'ipad', filename: 'AppIcon-29x29@2x.png', scale: '2x' },
                { size: '40x40', idiom: 'ipad', filename: 'AppIcon-40x40@1x.png', scale: '1x' },
                { size: '40x40', idiom: 'ipad', filename: 'AppIcon-40x40@2x.png', scale: '2x' },
                { size: '76x76', idiom: 'ipad', filename: 'AppIcon-76x76@1x.png', scale: '1x' },
                { size: '76x76', idiom: 'ipad', filename: 'AppIcon-76x76@2x.png', scale: '2x' },
                { size: '83.5x83.5', idiom: 'ipad', filename: 'AppIcon-83.5x83.5@2x.png', scale: '2x' },
                { size: '1024x1024', idiom: 'ios-marketing', filename: 'AppIcon-1024x1024@1x.png', scale: '1x' },
            ],
            info: {
                version: 1,
                author: 'xcode',
            },
        };

        fs.writeFileSync(
            path.join(iosBasePath, 'Contents.json'),
            JSON.stringify(contentsJson, null, 2)
        );
        console.log('  ✅ Generated Contents.json');

        console.log('\n✨ Success! All app icons have been generated!');
        console.log('\n📋 Next steps:');
        console.log('  1. Clean your build folders:');
        console.log('     - Android: cd android && ./gradlew clean');
        console.log('     - iOS: cd ios && rm -rf build && pod install');
        console.log('  2. Rebuild your app');
        console.log('  3. The new icon should appear!\n');

    } catch (error) {
        console.error('❌ Error generating icons:', error.message);
        console.error(error);
    }
}

// Run the script
generateIcons();
