FROM node:18.12.1-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY ./src/package.json ./src/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./src .

ARG VITE_USER_SERVICE_BASE_URL
ARG VITE_IDENTITY_SERVICE_BASE_URL
ARG VITE_CATALOG_SERVICE_BASE_URL
ARG VITE_LOGIN_UI_BASE_URL

RUN pnpm build

FROM alpine:latest
EXPOSE 80

RUN apk add --update nginx && rm -rf /var/cache/apk/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./config/nginx.non-root.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]