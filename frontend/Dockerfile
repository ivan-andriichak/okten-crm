# Production build stage
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final stage — serve через nginx
FROM nginx:alpine

# Копіюємо збілдований фронтенд
COPY --from=builder /app/dist /usr/share/nginx/html

# Копіюємо кастомний конфіг для nginx
COPY ../nginx.conf /etc/nginx/conf.d/default.conf

# Додаємо інструмент для hot reload у контейнері (якщо треба)
RUN apk add --no-cache inotify-tools

EXPOSE 80

# Автоreload nginx коли змінюється контент
CMD ["sh", "-c", "nginx -g 'daemon off;' & while inotifywait -r -e modify,create,delete /usr/share/nginx/html; do nginx -s reload; done"]
