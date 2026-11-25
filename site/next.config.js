const legacyDocumentationRoutes = require("./src/lib/legacyDocumentationRoutes.json");
const includeProxySnapshots = require("./scripts/include-proxy-snapshots.cjs");

module.exports = {
  outputFileTracingIncludes: {
    "/*": ["snapshots/**/*"],
    proxy: ["snapshots/**/*"],
  },
  compiler: {
    runAfterProductionCompile: includeProxySnapshots,
  },
  turbopack: {
    rules: {
      "*.css": {
        condition: {
          all: [
            {
              path: /^packages\/(core|countries|date-components|embla-carousel|highcharts-theme|icons|lab)\/src\//,
            },
            { not: { path: /\.module\.css$/ } },
            { not: { query: /raw|salt-stylesheet/ } },
          ],
        },
        loaders: [require.resolve("./loaders/salt-css.cjs")],
        as: "*.js",
      },
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
