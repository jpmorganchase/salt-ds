// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

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
  title: "Welcome to Salt",
  tagline: `An open-source design language for financial services and other industries. Whether you’re an internal J.P. Morgan team, a fintech start-up or building a UI for millions of customers, Salt provides well-documented components—with comprehensive design templates and assets.
Salt is the next-generation version of the established JPM UI Toolkit, which has been used to build over 1,200 websites and applications to date. It has a track record of increasing efficiency, ensuring design consistency and making significant cost savings for product teams. Rest assured, you’re in good hands.`,
  url: "https://your-docusaurus-test-site.com",
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
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/jpmorganchase/uitk",
          routeBasePath: "/",
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
        title: "Salt Design System",
        logo: {
          alt: "UITK Site Logo",
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
            to: "contributing/",
            position: "left",
            label: "Support and contributions",
          },
          {
            href: "https://github.com/jpmorganchase/uitk",
            "aria-label": "GitHub",
            position: "right",
            className: "header-github-link",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Getting Started",
                to: "getting-started/",
              },
              {
                label: "Components",
                to: "components/",
              },
              {
                label: "Contributing",
                to: "contributing/",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/jpmorganchase/uitk",
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} JPMorgan Chase & Co. All rights reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    }),
};

module.exports = config;
