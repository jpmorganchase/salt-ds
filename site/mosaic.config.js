const deepmerge = require("deepmerge");
const mosaicConfig = require("@jpmorganchase/mosaic-standard-generator/dist/fs.config.js");
const dotenvLoad = require("dotenv-load");
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
      modulePath: "@jpmorganchase/mosaic-plugins/SidebarPlugin",
      options: { rootDirGlob: "*/*" },
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/BreadcrumbsPlugin",
      disabled: true,
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/PublicAssetsPlugin",
      priority: -1,
      options: {
        outputDir: "./public",
        assets: ["sitemap.xml"],
      },
    },
    {
      modulePath: "@jpmorganchase/mosaic-plugins/TableOfContentsPlugin",
      options: {
        minRank: 2,
        maxRank: 2
      }
    },
    {
      modulePath: require.resolve(
        "./src/mosaic-plugins/LabsComponentPlugin.mjs"
      ),
      options: {
        labPackageName: "@salt-ds/lab",
        statusLabel: "Lab component",
        icon: "🚧",
      },
    },
    {
      modulePath: require.resolve(
        "./src/mosaic-plugins/ComponentsDocPaginatorPlugin.mjs"
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
  ],
});
