# Railway optimized - Phase 1 - Fixed for build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --frozen-lockfile || npm install --legacy-peer-deps
COPY . .
RUN ./node_modules/.bin/prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/server.js"]
