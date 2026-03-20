# Notes:
# Stage 1 (builder) — install ALL dependencies, compile TypeScript
# Stage 2 (production) — copy only the compiled dist/ and production dependencies

# Stage 1 - Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2 - Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 5000
CMD ["node", "dist/server.js"]
