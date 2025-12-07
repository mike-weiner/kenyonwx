FROM node:24-slim AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1 

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs24-minimal:nonroot

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV PORT=3000

EXPOSE ${PORT}

# Distroless cannot run npm; start Next.js directly
CMD ["/nodejs/bin/node", "node_modules/.bin/next", "start", "-p", "${PORT}"]
