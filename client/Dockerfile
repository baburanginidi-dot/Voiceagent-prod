# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.11.1
ARG VITE_API_BASE_URL=http://localhost:4000
ARG VITE_SOCKET_URL=http://localhost:4000

FROM node:${NODE_VERSION}-alpine AS builder
ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
WORKDIR /app
COPY package.json package-lock.json ./
COPY client ./client
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
RUN npm install
RUN npm run build:client

FROM node:${NODE_VERSION}-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client ./client
EXPOSE 4173
CMD ["npm", "run", "preview", "--prefix", "client", "--", "--host", "0.0.0.0", "--port", "4173"]
