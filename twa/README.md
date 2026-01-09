# TWA (Trusted Web Activity) - Android App Build Guide

Easy Gov Forms को Android App में convert करने के लिए follow करें:

## Prerequisites
1. Node.js installed
2. Java JDK 8+ installed
3. Android SDK installed (or Android Studio)

## Step 1: Install Bubblewrap CLI
```bash
npm install -g @anthropic/anthropic-sdk
```

## Step 2: Update Configuration
1. `twa-manifest.json` में अपना domain update करें
2. `your-domain.replit.app` को अपने actual Replit domain से replace करें

## Step 3: Initialize & Build
```bash
cd twa
bubblewrap init --manifest twa-manifest.json
bubblewrap build
```

## Step 4: Digital Asset Links Setup
Build करने के बाद, आपको assetlinks.json file मिलेगी। 
इसे अपने server के `.well-known/assetlinks.json` path पर deploy करें।

## Alternative: PWABuilder
1. https://www.pwabuilder.com पर जाएं
2. अपना Replit URL enter करें
3. "Package for stores" click करें
4. Android option select करें
5. APK download करें

## App Signing
Production release के लिए:
```bash
keytool -genkey -v -keystore android.keystore -alias easygovforms -keyalg RSA -keysize 2048 -validity 10000
```

## Files Generated
- `app-release-signed.apk` - Installable APK
- `app-release-bundle.aab` - Play Store upload file

## Testing
APK को Android phone पर install करके test करें।
