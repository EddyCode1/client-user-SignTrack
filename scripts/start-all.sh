#!/usr/bin/env bash
# Arranque unificado SignTrack Mobile:
#   1. Verifica que el Gateway esté en :5050 (o lo arranca del repo hermano)
#   2. Escribe .env si no existe (IP LAN para celular físico)
#   3. Compila la app Android nativa si es la primera vez
#   4. Levanta Metro (expo start --dev-client)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="${SIGNTRACK_BACKEND_DIR:-$(cd "$ROOT/../SignTrack-sandbox-ft-sajche" 2>/dev/null && pwd || echo "")}"
MARKER="$ROOT/.expo/native-android-ready"
GATEWAY_URL="http://localhost:5050/health"

log() { printf '\n▶ %s\n' "$1"; }

detect_lan_ip() {
  ipconfig getifaddr en0 2>/dev/null \
    || ipconfig getifaddr en1 2>/dev/null \
    || echo "192.168.1.160"
}

ensure_env_files() {
  log "Configurando .env"
  LAN_IP="$(detect_lan_ip)"
  if [ ! -f "$ROOT/.env" ]; then
    cat > "$ROOT/.env" <<EOF
# Celular físico en la misma WiFi que el servidor.
# El emulador Android usa 10.0.2.2:5050 automáticamente (no cambiar).
EXPO_PUBLIC_DEV_HOST=${LAN_IP}
EOF
    log "Creado $ROOT/.env (IP LAN ${LAN_IP})"
  fi
}

check_gateway() {
  curl -sf "$GATEWAY_URL" > /dev/null 2>&1
}

start_backend() {
  if [ -z "$BACKEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
    log "⚠  Backend no encontrado en $BACKEND_DIR"
    log "   Levanta manualmente: cd ../SignTrack-sandbox-ft-sajche && pnpm start:all"
    return 0
  fi

  log "Levantando backend SignTrack ($BACKEND_DIR)..."
  (
    cd "$BACKEND_DIR"
    # start:all en background (el script del sandbox tiene su propio loop)
    pnpm start:all &
  )

  log "Esperando que Gateway responda en $GATEWAY_URL (máx 60s)..."
  local attempts=0
  while ! check_gateway; do
    attempts=$((attempts + 1))
    if [ $attempts -ge 30 ]; then
      log "⚠  Gateway tardó demasiado. Continúa de todas formas."
      break
    fi
    sleep 2
  done
  log "Gateway OK ✓"
}

ensure_gateway() {
  if check_gateway; then
    log "Gateway ya está en :5050 ✓"
  else
    log "Gateway no responde en :5050 — intentando levantar backend..."
    start_backend
  fi
}

build_native_android_if_needed() {
  if [ "${START_ALL_SKIP_NATIVE:-0}" = "1" ]; then
    log "Omitiendo build nativo (START_ALL_SKIP_NATIVE=1)"
    return 0
  fi

  if [ -f "$MARKER" ]; then
    log "Dev build Android ya compilada ✓  (borra .expo/native-android-ready para forzar rebuild)"
    return 0
  fi

  log "Primera vez: compilando app Android con módulos nativos (10–20 min)..."
  log "  react-native-webrtc, @livekit/react-native, expo-camera, etc."
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
  log "  Emulador Android → escanea QR o presiona 'a' en Metro"
  log "  Celular físico   → escanea QR con la app Expo instalada"
  cd "$ROOT"
  exec npx expo start --dev-client -c
}

main() {
  log "=== SignTrack Mobile — arranque completo ==="
  ensure_env_files
  ensure_gateway
  build_native_android_if_needed
  start_metro
}

main "$@"
