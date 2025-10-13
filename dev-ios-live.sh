#!/bin/bash
set -e

# ============================================================
# 🧩 iOS Live Reload Build Script (UUID fixed)
# Author: Ha Pham, Khoa Dang
# Purpose: Run Vite + Capacitor iOS live reload on simulator or real device
# ============================================================

if ! command -v fzf &> /dev/null; then
  echo "⚠️  fzf not found — installing via Homebrew..."
  brew install fzf || {
    echo "❌ Failed to install fzf. Please install manually: brew install fzf"
    exit 1
  }
fi

echo "📱 Scanning available devices..."

# --- Get simulator list (Name + UDID + State)
SIMULATORS=$(xcrun simctl list devices available | grep -E "Booted|Shutdown" | sed -E 's/^\s*//')

# --- Get real devices (Name + UDID)
REAL_DEVICES=$(xcrun xctrace list devices 2>/dev/null | grep -v "Simulator" | grep -v "== Devices ==" | grep -v "Unavailable")

MENU_ITEMS=""
if [ -n "$REAL_DEVICES" ]; then
  MENU_ITEMS+="\n=== Real Devices ===\n$REAL_DEVICES"
else
  MENU_ITEMS+="\n(No real devices connected)"
fi

MENU_ITEMS+="\n\n=== Simulators ===\n$SIMULATORS"

SELECTED_DEVICE=$(echo -e "$MENU_ITEMS" | fzf --ansi --prompt="Select iOS Device ▶ " --height=30 --border --reverse)

if [ -z "$SELECTED_DEVICE" ]; then
  echo "❌ No device selected. Exiting."
  exit 1
fi

# Extract device name and UUID
DEVICE_NAME=$(echo "$SELECTED_DEVICE" | sed -E 's/\s*\(.*//')
DEVICE_ID=$(echo "$SELECTED_DEVICE" | grep -oE '[0-9A-Fa-f-]{36}' || true)

if [ -z "$DEVICE_ID" ]; then
  echo "❌ Could not detect valid UUID for: $DEVICE_NAME"
  exit 1
fi

echo ""
echo "✅ Selected device: $DEVICE_NAME ($DEVICE_ID)"
echo ""

# --- Start Vite live dev server ---
echo "🚀 Starting Vite development server..."
npm run dev &

sleep 3
echo ""
echo "🔗 Syncing Capacitor iOS project..."
npx cap sync ios

echo ""
echo "🏗️ Running iOS app with Live Reload on: $DEVICE_NAME"

# --- Launch ---
npx cap run ios --target "$DEVICE_ID" --live-reload
