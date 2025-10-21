#!/bin/bash
set -e

APP_NAME="TinFood"
WORKSPACE="ios/App/App.xcworkspace"
SCHEME="App"
CONFIGURATION="Release"
BUILD_DIR="ios/build"
ARCHIVE_PATH="$BUILD_DIR/archive/$APP_NAME.xcarchive"
EXPORT_PATH="$BUILD_DIR/ipa"
EXPORT_OPTIONS_PLIST="$BUILD_DIR/ExportOptions.plist"

# 🧹 Clean up
rm -rf "$BUILD_DIR"
mkdir -p "$EXPORT_PATH"

echo "🧩 Building iOS .xcarchive ..."
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -sdk iphoneos \
  -archivePath "$ARCHIVE_PATH" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  DEVELOPMENT_TEAM="ZNGAZ5B43Z" \

echo "📦 Creating ExportOptions.plist ..."
cat > "$EXPORT_OPTIONS_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" \
"http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>debugging</string>
  <key>compileBitcode</key>
  <false/>
  <key>signingStyle</key>
  <string>manual</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>teamID</key>
  <string>ZNGAZ5B43Z</string>
  <key>thinning</key>
  <string>&lt;none&gt;</string>
</dict>
</plist>
EOF

echo "📦 Exporting .ipa ..."
if xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  DEVELOPMENT_TEAM="ZNGAZ5B43Z" \
  ; then
    DATE=$(date +"%b%d_%H%M")
    FINAL_IPA="$EXPORT_PATH/${APP_NAME}_${DATE}.ipa"
    mv "$EXPORT_PATH/$APP_NAME.ipa" "$FINAL_IPA" 2>/dev/null || true
    echo "✅ IPA exported: $FINAL_IPA"
else
    echo "❌ Failed to export IPA."
    echo "You can still find the .xcarchive at: $ARCHIVE_PATH"
fi
