/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

module.exports = {
  async rewrites() {
    console.log("Rewrites")
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/:path*", // Proxy to local Backend
        // destination: "https://my-express-backend.fly.dev/:path*", // Proxy to Backend
      },
    ];
  },
};
