FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Si vous avez un build (TypeScript, Webpack, etc.), l'exécuter ici
# RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node", "src/server.js"]
