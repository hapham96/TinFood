#!/bin/bash
set -e

echo "📦 Building iOS app for normal development run..."

# 1️⃣ Build web assets (Vite)
echo "🚀 Building frontend..."
npm run build

# 2️⃣ Sync with Capacitor iOS project
echo "🔄 Syncing with Capacitor iOS project..."
npx cap sync ios

# 3️⃣ Optionally clean DerivedData (avoid stale cache)
echo "🧹 Cleaning old DerivedData cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/* || true

# 4️⃣ Open the project in Xcode
echo "🧰 Opening Xcode..."
npx cap open ios

echo "✅ Done! You can now select a device or simulator in Xcode and click ▶️ Run."
