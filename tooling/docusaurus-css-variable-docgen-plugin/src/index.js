const fs = require("fs");
const path = require("path");
const util = require("util");

const Glob = require("glob");

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

function plugin(context, { src, route }) {
  return {
    name: "docusaurus-css-variable-docgen-plugin",
    async loadContent() {
      const fileOpts = { encoding: "utf-8" };
      const files = await glob(Array.isArray(src) ? src.join(",") : src);

      return (
        await asyncMap(files, async (file) => {
          try {
            const x = await readFile(file, fileOpts);
            // parse css file here
            // walk css file and convert to an object
            return {
              cssData: x,
              file,
            };
          } catch (e) {
            console.warn(e.message, file);
          }
        })
      ).filter(Boolean);
    },
    async contentLoaded({ content, actions }) {
      const re = /\.css?/gi;
      const { createData, addRoute } = actions;

      const data = content.reduce((acc, { file, cssData }) => {
        acc[path.basename(file).toLowerCase().replace(re, "")] = cssData;

        return acc;
      }, {});

      addRoute({
        ...route,
        modules: {
          cssData: await createData("foo.json", JSON.stringify(data)),
        },
      });
    },
  };
}

module.exports = plugin;
