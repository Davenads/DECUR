// This helper script is used to load the TypeScript configuration files
// Next.js typically expects JavaScript configuration files

const nextConfig = require('./next.config.ts');
const postcssConfig = require('./postcss.config.ts');
const tailwindConfig = require('./tailwind.config.ts');

module.exports = {
  nextConfig,
  postcssConfig,
  tailwindConfig
};