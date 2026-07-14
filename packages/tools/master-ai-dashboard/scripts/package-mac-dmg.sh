#!/usr/bin/env bash
# Package Master AI Command Center as a Mac .dmg, then refresh Finder and open it.
# Run this ON your local Mac (hdiutil / electron-builder mac target required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "ERROR: package-mac-dmg.sh must run on your local Mac (found: $(uname -s))."
  echo "On this Mac:"
  echo "  cd packages/tools/master-ai-dashboard && npm run package:mac"
  exit 1
fi

echo "==> Building web assets (vite)…"
npm run build

echo "==> Installing desktop packaging deps (electron + electron-builder)…"
npm install --no-save --no-package-lock electron@33 electron-builder@25 2>/dev/null || \
  npm install --no-save electron@33 electron-builder@25

export CSC_IDENTITY_AUTO_DISCOVERY=false

echo "==> Packaging Mac DMG…"
npx electron-builder --mac dmg --config electron-builder.yml

RELEASE_DIR="$ROOT/release"
mkdir -p "$RELEASE_DIR"

# Prefer newest .dmg
DMG="$(ls -t "$RELEASE_DIR"/*.dmg 2>/dev/null | head -1 || true)"
if [[ -z "${DMG}" ]]; then
  # electron-builder sometimes writes to dist_electron / release depending on config
  DMG="$(ls -t "$ROOT"/dist_electron/*.dmg "$ROOT"/release/*.dmg 2>/dev/null | head -1 || true)"
fi

if [[ -z "${DMG}" ]]; then
  echo "ERROR: No .dmg found after build. Check electron-builder output."
  exit 1
fi

echo "==> Newest DMG: $DMG"
echo "==> Refreshing Finder & opening DMG…"

# Refresh Finder folder view, then open the new DMG
osascript <<APPLESCRIPT
tell application "Finder"
  activate
  try
    update POSIX file "$RELEASE_DIR" every item
  end try
  open POSIX file "$DMG"
end tell
APPLESCRIPT

# Also open via `open` for reliability
open "$DMG"

echo ""
echo "Done. Drag Master AI Command Center into Applications, then launch."
echo "Setup & key URLs: open setup.html inside the app, or:"
echo "  https://developers.pinterest.com/apps/"
echo "  https://platform.openai.com/api-keys"
