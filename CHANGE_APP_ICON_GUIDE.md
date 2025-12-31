# Change App Icon Guide

This guide will help you replace the default React Native app icon with your custom logo.

## Prerequisites

Your logo file: `assets/logo.jpeg` ✅

## Method 1: Automated Script (Recommended)

### Step 1: Install Required Package

```bash
npm install sharp
```

### Step 2: Run the Icon Generator Script

```bash
node generate-app-icons.js
```

This script will automatically:
- Convert your logo.jpeg to PNG format
- Generate all required icon sizes for Android (48px to 192px)
- Generate all required icon sizes for iOS (20px to 1024px)
- Create round icons for Android
- Generate the iOS Contents.json file

### Step 3: Clean Build Folders

**For Android:**
```bash
cd android
./gradlew clean
cd ..
```

**For iOS (if you're building for iOS):**
```bash
cd ios
rm -rf build
pod install
cd ..
```

### Step 4: Rebuild Your App

```bash
# For Android
npx react-native run-android

# For iOS (Mac only)
npx react-native run-ios
```

---

## Method 2: Manual Icon Replacement

If the automated script doesn't work, you can manually replace the icons:

### For Android:

1. You need to create PNG versions of your logo in these sizes:
   - **mdpi**: 48x48px
   - **hdpi**: 72x72px
   - **xhdpi**: 96x96px
   - **xxhdpi**: 144x144px
   - **xxxhdpi**: 192x192px

2. Replace the files in these folders:
   ```
   android/app/src/main/res/mipmap-mdpi/ic_launcher.png
   android/app/src/main/res/mipmap-hdpi/ic_launcher.png
   android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
   android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
   android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
   ```

3. Also replace the round icons:
   ```
   android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
   android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
   android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
   android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
   android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
   ```

### For iOS:

Replace icons in: `ios/PSC1/Images.xcassets/AppIcon.appiconset/`

Required sizes:
- 20x20 (@1x, @2x, @3x)
- 29x29 (@1x, @2x, @3x)
- 40x40 (@1x, @2x, @3x)
- 60x60 (@2x, @3x)
- 76x76 (@1x, @2x)
- 83.5x83.5 (@2x)
- 1024x1024 (@1x) - App Store icon

---

## Method 3: Using Online Tools

If you prefer using online tools:

1. Visit: https://www.appicon.co/ or https://icon.kitchen/
2. Upload your `logo.jpeg`
3. Download the generated icon pack
4. Extract and copy the icons to the respective folders mentioned above

---

## Troubleshooting

### Icon not changing after rebuild?

1. **Clear cache:**
   ```bash
   # Android
   cd android
   ./gradlew clean
   cd ..
   
   # Clear Metro bundler cache
   npx react-native start --reset-cache
   ```

2. **Uninstall the app from your device/emulator** and reinstall it

3. **Check if the icon files were properly replaced** in the mipmap folders

### Icon looks blurry or pixelated?

- Make sure your source logo (`logo.jpeg`) is high resolution (at least 1024x1024px)
- The script will automatically resize it to all required sizes

### Script fails with "sharp" error?

- Make sure you installed sharp: `npm install sharp`
- If it still fails, try: `npm install --platform=win32 --arch=x64 sharp`

---

## Verification

After completing the steps:

1. Check Android: Look in `android/app/src/main/res/mipmap-*/` folders
2. Check iOS: Look in `ios/PSC1/Images.xcassets/AppIcon.appiconset/`
3. Rebuild and run your app
4. The new icon should appear on your device!

---

## Notes

- The icon should be **square** (1:1 aspect ratio)
- Recommended source size: **1024x1024px** or larger
- File format: PNG with transparent background (if needed)
- Your logo.jpeg will be automatically converted to PNG by the script

---

## Quick Commands Summary

```bash
# Install sharp
npm install sharp

# Generate icons
node generate-app-icons.js

# Clean Android
cd android && ./gradlew clean && cd ..

# Rebuild
npx react-native run-android
```

That's it! Your app should now have your custom logo as the icon! 🎉
