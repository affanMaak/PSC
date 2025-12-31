FROM node:22-alpine3.20 AS builder
WORKDIR /client
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine3.20
WORKDIR /client
RUN npm install -g serve
COPY --from=builder /client/dist /client/dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]

