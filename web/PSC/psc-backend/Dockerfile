# -----------------------------
# 1. BUILDER STAGE
# -----------------------------
FROM node:20-slim AS builder

# Install OpenSSL for Prisma engine
RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client after openssl is installed
RUN npx prisma generate

# Build the project
RUN npm run build



# -----------------------------
# 2. PRODUCTION STAGE
# -----------------------------
FROM node:20-slim AS production

# Install OpenSSL in production image also (required by Prisma at runtime)
RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled build + Prisma engine files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
