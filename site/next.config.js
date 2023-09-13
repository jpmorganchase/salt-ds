const webpack = require("webpack");

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "@jpmorganchase/mosaic-components",
    "@jpmorganchase/mosaic-content-editor-plugin",
    "@jpmorganchase/mosaic-labs-components",
    "@jpmorganchase/mosaic-layouts",
    "@jpmorganchase/mosaic-open-api-component",
    "@jpmorganchase/mosaic-site-components",
    "@jpmorganchase/mosaic-site-middleware",
    "@jpmorganchase/mosaic-theme",
    "@jpmorganchase/mosaic-store",
  ],
  rewrites() {
    return {
      // These rewrites are checked after headers/redirects
      // and before all files including _next/public files which
      // allows overriding page files
      beforeFiles: [
        { source: "/favicon.ico", destination: "/img/favicon.png" },
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
    // Swaps out Buble for a smaller version that removes the latest Regex spec features.
    // See https://github.com/FormidableLabs/react-live#what-bundle-size-can-i-expect
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^buble$/,
        require.resolve("@philpl/buble")
      )
    );
    // Required by MDX-JS
    if (config.resolve.fallback) {
      config.resolve.fallback.fs = false;
    } else {
      config.resolve.fallback = { fs: false };
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
    ];
  },
};
