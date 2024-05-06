/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  eslint: {
    ignoreDuringBuilds: true
  },
  images:{
    loader:'custom',
    domains: ['va7.notion.site/*'],
    unoptimized: true
  },
  presets: ['@next/babel'],
  plugins:[
    "@babel/plugin-syntax-top-level-await"
  ]
};

module.exports = nextConfig;
