# Cliente móvil — Arranque nativo

Guía rápida para desarrollo Android/iOS. Ver también [`deploy/README.md`](deploy/README.md).

## Un solo comando (recomendado)

```bash
pnpm install
pnpm start:all
```

Eso hace **todo en orden**:
1. Crea `.env` si falta
2. Levanta Docker (Mongo + API + web)
3. **Primera vez:** compila e instala la app Android **con mapas** (`expo prebuild` + `run:android`)
4. Arranca Metro (`expo dev`)

| Servicio | URL |
|----------|-----|
| API (Docker) | http://localhost:3016/GestorRestaurante/v1/health |
| App web (Docker) | http://localhost:8082 |
| Metro / dev client | QR en terminal |

> **No uses Expo Go.** Requiere dev build (`expo-dev-client` + `react-native-maps`).

### Días siguientes (ya compilaste una vez)

```bash
pnpm start:all
```

Salta el compile nativo si existe `.expo/native-android-ready`.

Solo Metro + Docker:

```bash
pnpm docker:up && pnpm dev
```

### Forzar rebuild de mapas / plugins nativos

```bash
pnpm rebuild:native
pnpm dev
```

## Requisitos

- Node 22 + pnpm
- Docker Desktop
- Android Studio (emulador) o dispositivo físico

## Credenciales de prueba

| Email                   | Password     | Rol     |
|-------------------------|--------------|---------|
| cliente@restaurante.com | Cliente1234  | CLIENTE |

## Mapas

Ver [`docs/MAPAS.md`](docs/MAPAS.md).

Si ves *"Mapa nativo no disponible"*: corre `pnpm rebuild:native` o `pnpm start:all` (borra `.expo/native-android-ready` antes).
