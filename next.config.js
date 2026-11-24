/** @type {import('next').NextConfig} */
module.exports = {
  // Build a self-contained server in .next/standalone for the production Docker image.
  //
  // Next.js traces which files the server actually imports and copies only those
  // (plus a minimal server.js) into .next/standalone, including a trimmed
  // node_modules. The image then needs neither the full node_modules (build
  // tooling like SWC, Tailwind and PostCSS) nor npm at runtime, so it can run on
  // the minimal hardened Node image with `node server.js`.
  //
  // Static client assets (.next/static) and public/ are NOT included and must be
  // copied separately; see the Dockerfile.
  //
  // Docs: https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
  output: 'standalone',
};
