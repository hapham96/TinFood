#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Step 1: Build ReactJS project with Vite
echo ">>> Building React project..."
npm run build

# Step 2: Sync built files into Capacitor's Android project
echo ">>> Syncing files into Android project..."
npx cap sync android

# Step 3: Go to Android folder
cd android

# Step 4: Clean old builds
echo ">>> Cleaning old build cache..."
./gradlew clean

# Step 5: Build Debug APK
echo ">>> Building Debug APK..."
./gradlew assembleDebug

# Step 6: Get current date and time for file naming
# Format: Sep12_1430
BUILD_TIME=$(date +"%b%d_%H%M")

# Step 7: Rename and copy APK with timestamp
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
OUTPUT_DIR="../build-apk"
OUTPUT_NAME="tinfood_${BUILD_TIME}.apk"

mkdir -p $OUTPUT_DIR
cp "$APK_PATH" "$OUTPUT_DIR/$OUTPUT_NAME"

# Step 8: Show output APK path
echo "✅ Build success!"
echo "APK is saved as: $OUTPUT_DIR/$OUTPUT_NAME"
