/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Export a static site so GitHub Pages can host it
  output: 'export',

  // If you use next/image anywhere, this avoids server image optimization
  images: { unoptimized: true },

  // GitHub Pages serves the site under /<repo-name>/
  basePath: isProd ? '/swiss-expert-league' : '',
  assetPrefix: isProd ? '/swiss-expert-league/' : '',

  // DO NOT expose server-side secrets to the client.
  // Only expose public vars via NEXT_PUBLIC_* at build time.
};

module.exports = nextConfig;