const { existsSync } = require("node:fs");
const path = require("node:path");

function nextConfig(
  _phase,
  { environment = process.env, fileExists = existsSync } = {},
) {
  const offlineAuthorPreview = environment.SALT_OFFLINE_AUTHOR_PREVIEW === "1";
  const generatedPreviewDirectory = path.join(__dirname, "public", "ai");
  if (!offlineAuthorPreview && fileExists(generatedPreviewDirectory)) {
    throw new Error(
      "site/public/ai is a generated local Salt AI preview. Use SALT_OFFLINE_AUTHOR_PREVIEW=1 with the offline-author preview, or remove site/public/ai before an ordinary site build.",
    );
  }

  return {
    outputFileTracingIncludes: { "/*": ["snapshots/**/*"] },
    transpilePackages: [
      "@jpmorganchase/mosaic-site-middleware",
      "@jpmorganchase/mosaic-store",
    ],
    rewrites() {
      return {
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
        afterFiles: [],
      };
    },
    images: { domains: [] },
    webpack(config) {
      if (offlineAuthorPreview) {
        config.resolve.alias["@site/fonts"] = path.resolve(
          __dirname,
          "src/fonts/offline.ts",
        );
      }
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
    env: {
      NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW: offlineAuthorPreview ? "1" : "0",
    },
    async redirects() {
      return [
        { source: "/", destination: "/salt/index", permanent: true },
        { source: "/salt", destination: "/salt/index", permanent: true },
        {
          source: "/salt/theming/:slug*",
          destination: "/salt/themes/:slug*",
          permanent: true,
        },
      ];
    },
  };
}

module.exports = nextConfig;
