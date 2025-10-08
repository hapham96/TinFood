#!/bin/bash
set -e

APP_NAME="tinfood"
DATE=$(date +"%b%d_%H%M") # ex Oct06_1420
OUTPUT_DIR="../build-ios"
IPA_NAME="${APP_NAME}_${DATE}.ipa"

echo "🚀 Building Vite project..."
npm run build

echo "📦 Copying build to iOS folder..."
npx cap copy ios

echo "🧹 Syncing Capacitor..."
npx cap sync ios

# Ensure build output directory exists
mkdir -p $OUTPUT_DIR

# Build iOS app using Xcode command line
echo "🛠️ Building IPA..."
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath $OUTPUT_DIR/${APP_NAME}.xcarchive \
  archive

# Export IPA (you can adjust export options)
xcodebuild \
  -exportArchive \
  -archivePath $OUTPUT_DIR/${APP_NAME}.xcarchive \
  -exportPath $OUTPUT_DIR \
  -exportOptionsPlist ios/exportOptions.plist

echo "✅ iOS build completed: $OUTPUT_DIR/${IPA_NAME}"
