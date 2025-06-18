FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN apt-get update && apt-get install -y curl
RUN npm install --production && npm install @nestjs/cli
COPY --from=builder /app/environments ./environments
COPY --from=builder /app/config.ts ./config.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
EXPOSE 5000
CMD ["npm", "run", "start:prod"]