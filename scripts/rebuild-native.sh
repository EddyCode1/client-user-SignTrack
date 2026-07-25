#!/usr/bin/env bash
# Fuerza recompilación nativa (mapas, plugins nuevos en app.json)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
rm -f "$ROOT/.expo/native-android-ready"
cd "$ROOT"
npx expo prebuild --platform android --clean
npx expo run:android --no-bundler
mkdir -p "$ROOT/.expo"
touch "$ROOT/.expo/native-android-ready"
echo "✓ Dev build Android reinstalada. Corre: pnpm dev"
