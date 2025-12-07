FROM node:24-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1 

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

# Create a non-root user called 'nonroot'
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN chown -R nonroot:nonroot /app

USER nonroot

ENV PORT=3000
EXPOSE ${PORT}

CMD ["npm", "run", "start"]
