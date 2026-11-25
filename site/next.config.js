const legacyDocumentationRoutes = require("./src/lib/legacyDocumentationRoutes.json");

module.exports = {
  outputFileTracingIncludes: {
    "/*": ["snapshots/**/*"],
    proxy: ["snapshots/**/*"],
  },
  turbopack: {
    rules: {
      "*": {
        condition: { query: /raw/ },
        type: "text",
      },
    },
  },
  transpilePackages: [
    "@jpmorganchase/mosaic-site-middleware",
    "@jpmorganchase/mosaic-store",
  ],
  rewrites() {
    return {
      // These rewrites are checked after headers/redirects
      // and before all files including _next/public files which
      // allows overriding page files
      beforeFiles: legacyDocumentationRoutes.map((section) => ({
        source: `/${section}/:path*`,
        destination: `/salt/${section}/:path*`,
      })),
      // These rewrites are checked after pages/public files
      // are checked but before dynamic routes
      afterFiles: [],
    };
  },
  images: {
    domains: [
      /** Insert the domains where you will load images from */
      /* https://nextjs.org/docs/messages/next-image-unconfigured-host */
    ],
  },
  env: {},
  async redirects() {
    return [
      {
        source: "/",
        destination: "/salt/index",
        permanent: true,
      },
      {
        source: "/salt",
        destination: "/salt/index",
        permanent: true,
      },
      {
        source: "/salt/theming/:slug*",
        destination: "/salt/themes/:slug*",
        permanent: true,
      },
    ];
  },
};
