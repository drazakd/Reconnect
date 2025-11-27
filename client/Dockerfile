#Dockerfile client
# Stage 1 : construction avec Node
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# On peut transmettre l'URL de l'API en build-arg si besoin
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# # Stage 2 : serveur Nginx
# FROM nginx:stable-alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
CMD ["npm", "run", "dev"]
