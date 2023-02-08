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
  sources: [
    {
      modulePath: "@jpmorganchase/mosaic-source-git-repo",
      namespace: "mosaic",
      options: {
        prefixDir: "mosaic",
        cache: true,
        subfolder: "docs",
        repo: "https://github.com/jpmorganchase/mosaic.git",
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
