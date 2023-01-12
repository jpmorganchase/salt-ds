const fs = require("fs");
const path = require("path");
const util = require("util");
const Glob = require("glob");

const parseCSS = require("../parseCSS");

const asyncMap = (array, cb) => {
  const promises = new Array(array.length);

  for (let i = 0; i < array.length; i++) {
    promises.push(cb(array[i], i, array));
  }

  return Promise.all(promises);
};

const { promisify } = util;
const glob = promisify(Glob);
const readFile = promisify(fs.readFile);

function plugin(_, { src }) {
  return {
    name: "docusaurus-css-variable-docgen-plugin",
    async loadContent() {
      const fileOpts = { encoding: "utf-8" };
      const files = await glob(Array.isArray(src) ? src.join(",") : src);

      return (
        await asyncMap(files, async (file) => {
          try {
            const rawCSSData = await readFile(file, fileOpts);

            const parsedCSS = parseCSS(rawCSSData, file);

            // parse css file here
            // walk css file and convert to an object
            return {
              cssData: parsedCSS,
              file,
            };
          } catch (e) {
            console.warn(e.message, file);
          }
        })
      ).filter(Boolean);
    },
    async contentLoaded({ content, actions: { createData } }) {
      const re = /\.css?/gi;
      content.forEach(async ({ file, cssData }) => {
        await createData(
          `${path.basename(file).replace(re, "")}.json`,
          JSON.stringify(cssData)
        );
      });
    },
    configureWebpack(config) {
      return {
        resolve: {
          alias: {
            "@css-docgen": path.join(
              config.resolve.alias["@generated"],
              "docusaurus-css-variable-docgen-plugin",
              "default"
            ),
          },
        },
      };
    },
  };
}

module.exports = plugin;
