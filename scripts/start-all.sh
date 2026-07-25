#!/usr/bin/env bash
# Arranque unificado: Docker (API + Mongo) + dev build Android con mapas + Metro.
# Uso: pnpm start:all   (primera vez tarda ~15-20 min por compile nativo)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY="$ROOT/deploy"
MARKER="$ROOT/.expo/native-android-ready"
API_PORT="${EXPO_PUBLIC_API_PORT:-3016}"
HEALTH_URL="http://localhost:${API_PORT}/GestorRestaurante/v1/health"

DOCKER="${DOCKER:-docker}"
if ! command -v "$DOCKER" >/dev/null 2>&1; then
  DOCKER="/usr/local/bin/docker"
fi

log() { printf '\n▶ %s\n' "$1"; }

detect_lan_ip() {
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.1.160"
}

ensure_env_files() {
  log "Configurando .env"
  if [ ! -f "$DEPLOY/.env" ]; then
    cp "$DEPLOY/.env.example" "$DEPLOY/.env"
  fi

  LAN_IP="$(detect_lan_ip)"
  if [ ! -f "$ROOT/.env" ]; then
    cat > "$ROOT/.env" <<EOF
# Generado por scripts/start-all.sh — emulador Android usa 10.0.2.2 automático
EXPO_PUBLIC_DEV_HOST=${LAN_IP}
EXPO_PUBLIC_API_PORT=${API_PORT}
EOF
    log "Creado $ROOT/.env (IP LAN ${LAN_IP} para celular físico)"
  fi

  # Asegurar puerto API en deploy/.env
  if ! grep -q "^EXPO_PUBLIC_API_PORT=" "$DEPLOY/.env" 2>/dev/null; then
    echo "EXPO_PUBLIC_API_PORT=${API_PORT}" >> "$DEPLOY/.env"
  fi
}

start_docker() {
  log "Levantando backend con Docker (Mongo + API + web)"
  if [ ! -d "$ROOT/../../Gesti-n-de-Restaurante" ]; then
    echo "Error: no se encuentra Gesti-n-de-Restaurante en ../../Gesti-n-de-Restaurante"
    exit 1
  fi

  (
    cd "$DEPLOY"
    "$DOCKER" compose up -d --build
  )

  log "Esperando API en ${HEALTH_URL}"
  for i in $(seq 1 45); do
    if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
      log "API lista ✓"
      return 0
    fi
    sleep 2
  done
  echo "Error: la API no respondió a tiempo. Revisa: cd deploy && docker compose logs node-api"
  exit 1
}

build_native_android_if_needed() {
  if [ "${START_ALL_SKIP_NATIVE:-0}" = "1" ]; then
    log "Omitiendo build nativo (START_ALL_SKIP_NATIVE=1)"
    return 0
  fi

  if [ -f "$MARKER" ]; then
    log "Dev build Android con mapas ya compilada ✓ (borra .expo/native-android-ready para forzar rebuild)"
    return 0
  fi

  log "Primera vez: compilando app Android con mapas nativos (10-20 min)..."
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
  log "Emulador → escanea QR o abre Omakase | Web Docker → http://localhost:8082"
  log "Login: cliente@restaurante.com / Cliente1234"
  cd "$ROOT"
  exec npx expo start --dev-client -c
}

main() {
  log "=== Omakase — arranque completo ==="
  ensure_env_files
  start_docker
  build_native_android_if_needed
  start_metro
}

main "$@"
