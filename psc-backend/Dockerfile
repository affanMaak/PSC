FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client for Debian
RUN npx prisma generate

RUN npm run build


FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy only what is needed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
