const deepmerge = require("deepmerge");
const mosaicConfig = require("@jpmorganchase/mosaic-standard-generator/dist/fs.config.js");

/** Enhance/modify your Mosaic core fs
 * pageExtensions: supported file extensions which can be stored in the Virtual File System (VFS) created by Core FS
 * ignorePages: list of files which will be ignored from pulled content,
 * serialisers: define serialisers and deserialisers for the supported file extensions
 * plugins: <...plugin definitions>
 * sources: <...source definitions>
 */
module.exports = deepmerge(mosaicConfig, {
  deployment: { mode: "snapshot-file", platform: "vercel" },
  sources: [
    {
      modulePath: "@jpmorganchase/mosaic-source-git-repo",
      namespace: "salt",
      options: {
        prefixDir: "salt",
        cache: true,
        subfolder: "mosaic-site/docs",
        credentials: process.env.MOSAIC_DOCS_CLONE_CREDENTIALS,
        repo: "https://github.com/jpmorganchase/salt-ds.git",
        branch: "main",
        extensions: [".mdx"],
        remote: "origin",
      },
    },
    {
      modulePath: "@jpmorganchase/mosaic-source-local-folder",
      namespace: "local",
      options: {
        rootDir: "./docs",
        prefixDir: "local",
        extensions: [".mdx"],
      },
    },
  ],
});
