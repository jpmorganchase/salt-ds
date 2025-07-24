const deepmerge = require("deepmerge");
const mosaicConfig = require("@jpmorganchase/mosaic-standard-generator/dist/fs.config.js");
const dotenvLoad = require("dotenv-load");
const { pathToFileURL } = require("node:url");
dotenvLoad();

/** Enhance/modify your Mosaic core fs
 * pageExtensions: supported file extensions which can be stored in the Virtual File System (VFS) created by Core FS
 * ignorePages: list of files which will be ignored from pulled content,
 * serialisers: define serialisers and deserialisers for the supported file extensions
 * plugins: <...plugin definitions>
 * sources: <...source definitions>
 */

const saltConfig = {
  ...mosaicConfig,
  plugins: [
    ...mosaicConfig.plugins,
    {
      modulePath: require.resolve("./src/mosaic-plugins/SidebarPlugin.mjs"),
      priority: 2,
      options: { rootDirGlob: "*/*" },
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/BreadcrumbsPlugin",
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/SearchIndexPlugin",
      previewDisabled: true,
      options: { maxLineLength: 240, maxLineCount: 240 },
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

module.exports = deepmerge(saltConfig, {
  deployment: { mode: "snapshot-file", platform: "vercel" },
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
