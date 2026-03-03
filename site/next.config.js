module.exports = {
  outputFileTracingIncludes: {
    "/*": ["snapshots/**/*"],
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
      beforeFiles: [
        {
          source: "/getting-started/:path*",
          destination: "/salt/getting-started/:path*",
        },
        {
          source: "/components/:path*",
          destination: "/salt/components/:path*",
        },
        {
          source: "/support-and-contributions/:path*",
          destination: "/salt/support-and-contributions/:path*",
        },
      ],
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
  webpack(config) {
    for (const rule of config.module.rules) {
      if (rule.oneOf) {
        rule.oneOf.unshift({
          resourceQuery: /raw/,
          type: "asset/source",
        });
      }
    }

    return config;
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
