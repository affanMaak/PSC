# -------- Builder --------
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build project and generate Prisma client for production stage
RUN npx prisma generate
RUN npm run build

# -------- Production --------
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/main.js"]