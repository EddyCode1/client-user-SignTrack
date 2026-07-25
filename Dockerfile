FROM node:22-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm install -g pnpm@10.29.3 && pnpm install --frozen-lockfile

COPY . .

ARG EXPO_PUBLIC_DEV_HOST=localhost
ARG EXPO_PUBLIC_API_PORT=3006
ARG EXPO_PUBLIC_AUTH_URL=https://gesti-n-de-restaurante.onrender.com/GestorRestaurante/v1/auth
ARG EXPO_PUBLIC_API_BASE=https://gesti-n-de-restaurante.onrender.com/GestorRestaurante/v1

ENV EXPO_PUBLIC_DEV_HOST=$EXPO_PUBLIC_DEV_HOST
ENV EXPO_PUBLIC_API_PORT=$EXPO_PUBLIC_API_PORT
ENV EXPO_PUBLIC_AUTH_URL=$EXPO_PUBLIC_AUTH_URL
ENV EXPO_PUBLIC_API_BASE=$EXPO_PUBLIC_API_BASE

RUN npx expo export --platform web

FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm install -g serve@14.2.4

COPY --from=build /app/dist ./dist

EXPOSE 8081
CMD ["serve", "dist", "-l", "8081", "-s"]
