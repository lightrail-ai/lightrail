/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    urlImports: ["http://localhost:3000/"],
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
