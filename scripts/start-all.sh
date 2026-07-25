#!/usr/bin/env bash
# Arranque unificado: Docker (API + Mongo) + dev build Android + Metro.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKER="$ROOT/.expo/native-android-ready"

log() { printf '\n▶ %s\n' "$1"; }

detect_lan_ip() {
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.1.160"
}

ensure_env_files() {
  log "Configurando .env"
  LAN_IP="$(detect_lan_ip)"
  if [ ! -f "$ROOT/.env" ]; then
    cat > "$ROOT/.env" <<EOF
EXPO_PUBLIC_DEV_HOST=${LAN_IP}
EOF
    log "Creado $ROOT/.env (IP LAN ${LAN_IP} para celular físico)"
  fi
}

build_native_android_if_needed() {
  if [ "${START_ALL_SKIP_NATIVE:-0}" = "1" ]; then
    log "Omitiendo build nativo (START_ALL_SKIP_NATIVE=1)"
    return 0
  fi

  if [ -f "$MARKER" ]; then
    log "Dev build Android ya compilada ✓ (borra .expo/native-android-ready para forzar rebuild)"
    return 0
  fi

  log "Primera vez: compilando app Android (10-20 min)..."
  (
    cd "$ROOT"
    npx expo prebuild --platform android --clean
    npx expo run:android --no-bundler
  )
  mkdir -p "$(dirname "$MARKER")"
  touch "$MARKER"
  log "Dev build Android instalada ✓"
}

start_metro() {
  log "Iniciando Metro (Expo dev client)"
  log "Emulador → escanea QR o abre SignTrack"
  cd "$ROOT"
  exec npx expo start --dev-client -c
}

main() {
  log "=== SignTrack Mobile — arranque completo ==="
  ensure_env_files
  build_native_android_if_needed
  start_metro
}

main "$@"
