FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm install -g pnpm@10.29.3 && pnpm install --frozen-lockfile

COPY . .

ARG EXPO_PUBLIC_API_URL=https://signtrack-kinal.duckdns.org
ARG EXPO_PUBLIC_DEV_HOST=192.168.1.160
ARG EXPO_PUBLIC_LIVEKIT_URL=wss://signtrack-kinal.duckdns.org/livekit

ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_DEV_HOST=$EXPO_PUBLIC_DEV_HOST
ENV EXPO_PUBLIC_LIVEKIT_URL=$EXPO_PUBLIC_LIVEKIT_URL

RUN npx expo export --platform web

FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm install -g serve@14.2.4

COPY --from=build /app/dist ./dist

EXPOSE 8081
CMD ["serve", "dist", "-l", "8081", "-s"]
