# SignTrack Mobile — Cliente móvil

App móvil de SignTrack construida con Expo (React Native). Comunicación inclusiva con chat, videollamadas, tareas, calendario y contactos.

## Requisitos

- Node 22 + pnpm
- Android Studio (emulador) o dispositivo físico

## Desarrollo

```bash
pnpm install
pnpm dev
```

Esto inicia Metro bundler. Escanea el QR con la app Expo Go o un dev build.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia Metro con dev-client |
| `pnpm android` | Compila y corre en Android |
| `pnpm ios` | Compila y corre en iOS |
| `pnpm web` | Corre versión web |
| `pnpm prebuild` | Genera proyectos nativos |

## Estructura del proyecto

```
src/
├── features/
│   ├── auth/        — Login, registro, recuperación
│   ├── dashboard/   — Pantalla principal
│   ├── chats/       — Mensajería en tiempo real (SignalR)
│   ├── calls/       — Videollamadas (LiveKit / WebRTC)
│   ├── tasks/       — Gestión de tareas
│   ├── calendar/    — Calendario y citas
│   ├── contacts/    — Directorio de usuarios
│   ├── groups/      — Grupos de trabajo
│   ├── requests/    — Solicitudes e invitaciones
│   └── users/       — Perfil y administración
├── navigation/      — Stack y tabs de navegación
└── shared/          — API, stores, componentes, utilerías
```

## Tecnologías principales

- **Expo SDK 55** + React Native 0.83
- **React Navigation** (native-stack + bottom-tabs)
- **SignalR** para mensajería y llamadas en tiempo real
- **Zustand** + AsyncStorage para estado persistente
- **Axios** para llamadas HTTP
