// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/**
 * Determines if this is a local dev, PR or production build
 */
function getBuildType() {
  if (
    process.env.GITHUB_EVENT_NAME === "push" &&
    process.env.GITHUB_REF_NAME === "main"
  ) {
    return "prod";
  }
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    return "pr";
  }
  return "dev";
}

const favicons = {
  prod: "img/favicon.ico",
  pr: "img/favicon-pr.ico",
  dev: "img/favicon-dev.ico",
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Salt Design System",
  tagline: `Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessible components as well as comprehensive design templates, style libraries and assets.
  Salt is the next-generation version of the established internal J.P. Morgan UI Toolkit design system, which has been used to build over 1,200 websites and applications to date.
  In time, as a full-service solution, Salt will be the vehicle for digital delivery of a universal design language—with best-in-class business patterns, content and accessibility guides, tooling and adoption resources.`,
  url: "https://www.saltdesignsystem.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: favicons[getBuildType()],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
          breadcrumbs: false,
          // Intentionally disabling this for now, until we can incorporate the
          // "Edit page" links properly into our page layouts.
          //editUrl: "https://github.com/jpmorganchase/salt-ds/edit/main/site/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: "Salt Design System by J.P. Morgan",
          src: "img/logo.svg",
        },
        items: [
          {
            to: "/",
            position: "left",
            label: "Home",
            activeBaseRegex: "^/$",
          },
          {
            type: "doc",
            docId: "getting-started/index",
            position: "left",
            label: "Getting started",
          },
          {
            type: "doc",
            docId: "components/index",
            position: "left",
            label: "Components",
          },
          {
            type: "doc",
            docId: "support-and-contributions/index",
            position: "left",
            label: "Support and contributions",
          },
          {
            href: "https://github.com/jpmorganchase/salt-ds",
            "aria-label": "GitHub",
            position: "right",
            className: "header-github-link",
            label: "Github",
            target: "_self",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            items: [
              {
                label: "Terms of use",
                to: "https://www.jpmorgan.com/terms",
                target: "_self",
              },
              {
                label: "Privacy policy",
                to: "https://www.jpmorgan.com/privacy",
                target: "_self",
              },
              {
                label: "Contact us",
                to: "support-and-contributions/",
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} JPMorgan Chase & Co. All rights reserved.`,
      },
      prism: {},
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    }),
  plugins: [
    [
      "docusaurus-plugin-react-docgen-typescript",
      {
        // pass in a single string or an array of strings
        src: "../packages/core/src/**/*.tsx",
        parserOptions: {
          // pass parserOptions to react-docgen-typescript
          propFilter: (prop) => {
            if (prop.parent) {
              return !prop.parent.fileName.includes("@types/react");
            }

            return true;
          },
        },
      },
    ],
    [
      "../tooling/docusaurus-css-variable-docgen-plugin/src/index.js",
      {
        src: "../packages/core/src/**/*.css",
      },
    ],
  ],
};

async function createConfig() {
  const lightTheme = (await import("./prismLight.mjs")).default;

  // @ts-expect-error: we know it exists, right
  config.themeConfig.prism.theme = lightTheme;

  return config;
}

module.exports = createConfig;
