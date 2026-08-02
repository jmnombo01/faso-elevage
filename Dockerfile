FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --legacy-peer-deps
COPY backend ./backend
COPY backend/prisma ./backend/prisma
RUN cd backend && ./node_modules/.bin/prisma generate && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
EXPOSE 4000
CMD ["sh", "-c", "cd backend && ./node_modules/.bin/prisma migrate deploy && node dist/server.js"]
