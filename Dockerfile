# Dev variant with Socket Firewall: npm installs are screened for malicious packages
FROM dhi.io/node:26-alpine3.24-sfw-dev AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# Hardened runtime: no shell or npm, runs as non-root user "node" (uid 1000)
FROM dhi.io/node:26-alpine3.24

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Standalone output (see next.config.js) bundles server.js, the compiled server code,
# and only the node_modules the server actually uses.
COPY --from=builder --chown=node:node /app/.next/standalone ./

# Next.js intentionally leaves client assets (JS chunks, CSS, fonts served under
# /_next/static) out of standalone, so they must be copied separately or the
# page renders unstyled and non-interactive. If a public/ directory is added,
# copy it the same way: COPY --from=builder --chown=node:node /app/public ./public
#
# --chown gives the runtime user write access, which Next.js needs for .next/cache
# (image optimization / ISR). If neither is used, it could be dropped so the app
# files stay read-only.
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

EXPOSE ${PORT}

CMD ["node", "server.js"]
