// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Welcome to Salt",
  tagline: `Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessibility-focused components as well as comprehensive design templates, style libraries and assets.
  Salt is the next-generation version of the established internal J.P. Morgan UI Toolkit design system, which has been used to build over 1,200 websites and applications to date.
  In time, as a full-service solution, Salt will be the vehicle for digital delivery of a universal design language—with best-in-class business patterns, content and accessibility guides, tooling and adoption resources.`,
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

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
            label: "Getting started"
          },
          {
            type: "doc",
            docId: "components/index",
            position: "left",
            label: "Components",
          },
          {
            to: "support-and-contributions/",
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
            items: [
              {
                label: "Terms of use",
                to: "https://www.jpmorgan.com/terms",
              },
              {
                label: "Privacy policy",
                to: "https://www.jpmorgan.com/privacy",
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
