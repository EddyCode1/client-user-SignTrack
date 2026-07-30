# SignTrack Mobile — Guía de desarrollo

App nativa Expo (React Native) de SignTrack. Patrón idéntico al de Restaurante/Banco de Kinal.

---

## Requisitos previos

| Herramienta | Versión mínima |
|------------|---------------|
| Node.js | 22 |
| pnpm | 9+ |
| Android Studio | Ladybug+ |
| Expo CLI | `expo` ≥ 55 |
| Java (JDK) | 17+ |

El repo hermano del backend debe estar junto a este:

```
Kinal/
├── SignTrack-sandbox-ft-sajche/   ← backend
└── client-user-SignTrack/         ← este repo
```

---

## Arranque rápido (emulador Android)

```bash
# 1. Instalar dependencias (incluye módulos nativos — tarda la primera vez)
pnpm install

# 2. Levantar todo (backend + Metro + prebuild si es necesario)
pnpm start:all
```

`pnpm start:all` hace:
1. Verifica si el Gateway está en `http://localhost:5050/health`
2. Si no responde → arranca `pnpm start:all` del backend hermano
3. Primera vez: `expo prebuild` + `expo run:android` (10–20 min)
4. Levanta Metro con `--dev-client`

---

## Red: cómo llega el emulador al backend

| Destino | URL |
|---------|-----|
| Emulador Android | `http://10.0.2.2:5050` (automático) |
| Simulador iOS | `http://localhost:5050` (automático) |
| Celular físico (misma WiFi) | `http://<EXPO_PUBLIC_DEV_HOST>:5050` |
| Remoto (DuckDNS) | `https://signtrack-kinal.duckdns.org` |

### Configurar `.env` para celular físico

```bash
cp .env.example .env
# Edita EXPO_PUBLIC_DEV_HOST con la IP LAN de la Mac donde corre el backend
```

### Configurar para DuckDNS / remoto

```bash
# En .env o como variable de entorno:
EXPO_PUBLIC_API_URL=https://signtrack-kinal.duckdns.org
```

---

## Android: cleartext HTTP habilitado

`app.json` ya tiene `"usesCleartextTraffic": true` para permitir HTTP a `10.0.2.2`.
En producción (DuckDNS) se usa HTTPS → no aplica.

---

## Estructura del proyecto

```
src/
├── features/
│   ├── auth/          — Login, registro, recuperación
│   ├── calls/
│   │   ├── screens/
│   │   │   ├── CallsScreen.jsx           — Lista de salas
│   │   │   ├── CallRoomScreen.jsx        — Videollamada 1:1 WebRTC
│   │   │   └── CallRoomLiveKitScreen.jsx — Sala grupal LiveKit (≥3)
│   │   └── components/
│   │       └── IncomingCallModal.jsx     — Modal llamada entrante
│   ├── chats/         — Mensajería en tiempo real (SignalR)
│   ├── dashboard/     — Pantalla principal
│   ├── more/          — Pantalla "Más" (Tasks, Calendar, Contacts…)
│   └── …
├── navigation/
│   ├── AppNavigator.jsx   — Raíz con ConnectionBanner
│   ├── AuthStack.jsx      — Flujo no autenticado
│   ├── MainStack.jsx      — Stack principal + IncomingCallModal
│   └── MainTabs.jsx       — 4 tabs: Inicio · Chats · Llamadas · Más
└── shared/
    ├── api/
    │   ├── callsHubService.js     — Hub /hubs/calls (JoinCallRoom, WebRTC)
    │   ├── chatHubService.js      — Hub /hubs/chat
    │   ├── recognitionClient.js   — Servicio de reconocimiento de señas
    │   └── services/              — REST services (calls, chat, presence…)
    ├── config/
    │   └── env.js                 — Resolución de URLs por plataforma/entorno
    └── components/
        └── ConnectionBanner.jsx   — Banner offline
```

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_DEV_HOST` | IP LAN del servidor (celular físico) | `192.168.1.160` |
| `EXPO_PUBLIC_API_URL` | Override completo de URL (DuckDNS / HTTPS) | *(derivado)* |
| `EXPO_PUBLIC_LIVEKIT_URL` | URL del servidor LiveKit | *(derivado de API_URL)* |

---

## Dependencias nativas (requieren `expo prebuild`)

| Paquete | Para qué |
|---------|---------|
| `react-native-webrtc` | Videollamadas 1:1 (mesh) |
| `@livekit/react-native` | Salas grupales LiveKit |
| `@livekit/react-native-webrtc` | WebRTC para LiveKit |
| `expo-camera` | Panel de señas |
| `@react-native-community/datetimepicker` | Calendario |

Después de agregar dependencias nativas siempre hay que correr:

```bash
pnpm install
npx expo prebuild --platform android --clean
npx expo run:android
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm start:all` | Arranque completo (backend + Metro + prebuild) |
| `pnpm dev` | Solo Metro (backend ya levantado) |
| `pnpm android` | Compila y corre en Android |
| `pnpm ios` | Compila y corre en iOS |
| `pnpm prebuild` | Genera proyectos nativos |

---

## Hubs SignalR

| Hub | Ruta | Métodos invocados |
|-----|------|-------------------|
| Chat | `/hubs/chat` | `JoinConversation`, `LeaveConversation`, `SendTyping` |
| Calls | `/hubs/calls` | `JoinCallRoom`, `LeaveCallRoom`, `SendOffer`, `SendAnswer`, `SendIceCandidate` |

Eventos escuchados en Calls: `ExistingParticipants`, `ParticipantJoined`, `ParticipantLeft`, `ReceiveOffer`, `ReceiveAnswer`, `ReceiveIceCandidate`, `RoomEnded`, `IncomingCall`.

---

## Deploy remoto (demo fuera de LAN)

1. En la PC servidor: `pnpm start:home` + DuckDNS token + port forwarding 80/443/3478
2. En el `.env` del móvil o en EAS preview:
   ```
   EXPO_PUBLIC_API_URL=https://signtrack-kinal.duckdns.org
   ```
3. Build APK: `eas build --profile preview`

Ver [`docs/DEPLOY_GRATIS.md`](../SignTrack-sandbox-ft-sajche/docs/DEPLOY_GRATIS.md) en el backend.

---

## Tecnologías principales

- **Expo SDK 55** + React Native 0.83
- **React Navigation** (native-stack + bottom-tabs)
- **SignalR** — chat y señalización WebRTC en tiempo real
- **react-native-webrtc** — llamadas 1:1 mesh
- **@livekit/react-native** — salas grupales
- **Zustand** + AsyncStorage — estado persistente
- **Axios** — llamadas HTTP REST
