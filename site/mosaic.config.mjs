import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fsConfig from "@jpmorganchase/mosaic-cli/fs.config.js";
import nextEnv from "@next/env";
import deepmerge from "deepmerge";

const projectDir = process.cwd();
nextEnv.loadEnvConfig(projectDir, process.env.NODE_ENV === "development");

const require = createRequire(import.meta.url);

/** Enhance/modify your Mosaic core fs
 * pageExtensions: supported file extensions which can be stored in the Virtual File System (VFS) created by Core FS
 * ignorePages: list of files which will be ignored from pulled content,
 * serialisers: define serialisers and deserialisers for the supported file extensions
 * plugins: <...plugin definitions>
 * sources: <...source definitions>
 */

const saltConfig = {
  ...fsConfig,
  plugins: [
    ...fsConfig.plugins.map((plugin) => {
      switch (plugin.modulePath) {
        case "@jpmorganchase/mosaic-plugins/SidebarPlugin":
          return {
            ...plugin,
            modulePath: require.resolve(
              "./src/mosaic-plugins/SidebarPlugin.mjs",
            ),
            priority: 2,
            options: { ...plugin.options, rootDirGlob: "*/*" },
          };
        case "@jpmorganchase/mosaic-plugins/SearchIndexPlugin":
          return {
            ...plugin,
            options: { ...plugin.options, keys: ["keywords", "content"] },
          };
        case "@jpmorganchase/mosaic-plugins/TableOfContentsPlugin":
          return {
            ...plugin,
            options: { ...plugin.options, minRank: 2, maxRank: 2 },
          };
        case "@jpmorganchase/mosaic-plugins/LlmsTxtPlugin":
          return {
            ...plugin,
            options: {
              ...plugin.options,
              title: "Salt Design System",
              description:
                "Salt is an accessible React design system for building enterprise applications. Explore component usage, examples, API references, patterns and theming guidance.",
              siteUrl: process.env.SITE_URL,
              exclude: ["**/salt-github/**"],
              componentsModulePath: require.resolve(
                "./src/mosaic-plugins/markdownComponents.mjs",
              ),
            },
          };
        default:
          return plugin;
      }
    }),
    {
      modulePath: "@jpmorganchase/mosaic-plugins/SiteMapPlugin",
      options: {
        siteUrl: process.env.SITE_URL,
        exclude: ["**/salt-github/**"],
      },
      priority: Number.NEGATIVE_INFINITY,
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/PublicAssetsPlugin",
      priority: Number.NEGATIVE_INFINITY,
      options: {
        outputDir: "./public",
        assets: ["sitemap.xml", "search-data.json"],
      },
    },
    {
      modulePath: require.resolve(
        "./src/mosaic-plugins/LabsComponentPlugin.mjs",
      ),
    },
  ],
};

export default deepmerge(saltConfig, {
  sources: [
    {
      modulePath: "@jpmorganchase/mosaic-source-local-folder",
      namespace: "salt",
      options: {
        rootDir: "./docs",
        prefixDir: "salt",
        extensions: [".mdx"],
      },
    },
    {
      modulePath: "@jpmorganchase/mosaic-source-http",
      namespace: "salt",
      options: {
        prefixDir: "salt-github",
        requestTimeout: 30_000,
        endpoints: [
          "https://api.github.com/repos/jpmorganchase/salt-ds/releases",
        ],
        transformResponseToPagesModulePath: pathToFileURL(
          require.resolve("./src/mosaic-plugins/mosaic-github-transformer.mjs"),
        ).toString(),
      },
    },
  ],
});
