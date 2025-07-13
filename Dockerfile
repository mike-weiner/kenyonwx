FROM node:24-slim AS builder

WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js Telemetry
ENV NEXT_TELEMETRY_DISABLED=1 

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:24-slim

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
