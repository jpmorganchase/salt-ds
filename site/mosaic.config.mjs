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

const SEARCH_INDEX_PLUGIN = "@jpmorganchase/mosaic-plugins/SearchIndexPlugin";

/**
 * Mosaic's default SearchIndexPlugin runs after `$ref`s are resolved, so
 * tab pages get their component's title. Component pages list their other
 * names in `data.alsoKnownAs`, so a search for "Select" finds Dropdown.
 */
const searchIndexOptions = {
  maxLineLength: 240,
  maxLineCount: 240,
  records: {
    fields: {
      description: ["description", "data.description"],
      keywords: ["keywords", "data.alsoKnownAs"],
    },
  },
};

const saltConfig = {
  ...fsConfig,
  plugins: [
    ...fsConfig.plugins.map((plugin) =>
      plugin.modulePath === SEARCH_INDEX_PLUGIN
        ? { ...plugin, options: searchIndexOptions }
        : plugin,
    ),
    {
      modulePath: require.resolve("./src/mosaic-plugins/SidebarPlugin.mjs"),
      priority: 2,
      options: { rootDirGlob: "*/*" },
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/BreadcrumbsPlugin",
    },
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
        assets: ["sitemap.xml", "search-records.json"],
      },
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/FragmentPlugin",
      options: {},
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/TableOfContentsPlugin",
      options: {
        minRank: 2,
        maxRank: 2,
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
