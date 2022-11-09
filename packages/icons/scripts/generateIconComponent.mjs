/**
 *
 * Steps performed
 *
 * - Optimize SVG, https://github.com/svg/svgo
 *
 *   - Add `data-testid="Foo SVG"` to svg node
 *   - Export named component wrapped with Icon component
 *
 */

import fs from "fs";
import path from "path";
import glob from "glob";
import prettier from "prettier";
import Mustache from "mustache";
import { optimize } from "svgo";
import { fileURLToPath } from "url";
import { svgAttributeMap } from "./svgAttributeMap.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Change kebab casing to Pascal casing */
function pascalCase(str) {
  let arr = str.split("-");
  let capital = arr.map(
    (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
  );

  return capital.join("");
}

const fileArg = process.argv.splice(2).join("|");
// options is optional
const options = {};
const basePath = path.join(__dirname, "../src");

const template = fs.readFileSync(
  path.join(__dirname, "./templateIcon.mustache"),
  "utf-8"
);
const globPath = path.join(basePath, `./SVG/+(${fileArg})`).replace(/\\/g, "/");
console.log("globPath", globPath);
glob(globPath, options, function (error, filenames) {
  filenames.forEach((fileName) => {
    fs.readFile(fileName, "utf-8", (error, svgString) => {
      if (error) throw error;

      const filenameWithoutExtension = path.parse(fileName).name;
      const componentName = pascalCase(filenameWithoutExtension);
      let viewBox;
      const newFileName = path.join(
        basePath,
        "./components/",
        componentName + ".tsx"
      );

      console.log("processing", fileName, "to", newFileName);

      let iconTitle = filenameWithoutExtension
        .split("-")
        .join(" ")
        .toLowerCase();

      // SVGO is a separate step to enable multi-pass optimizations.
      const optimizedSvg = optimize(svgString, {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                // makes icons scaled into width/height box
                removeViewBox: false,
              },
            },
          },
          {
            name: "removeAttrs",
            params: {
              attrs: "(fill|width|height)",
            },
          },
        ],
      });

      const svgPaths = optimize(optimizedSvg.data, {
        plugins: [
          {
            name: "mapHTMLAttributesToReactProps",
            fn: () => {
              return {
                element: {
                  enter: (node) => {
                    const newAttributes = {};
                    // preserve an order of attributes
                    for (const [name, value] of Object.entries(
                      node.attributes
                    )) {
                      newAttributes[svgAttributeMap[name] || name] = value;
                    }
                    node.attributes = newAttributes;
                  },
                },
              };
            },
          },
          {
            name: "find-viewBox",
            fn: () => {
              return {
                element: {
                  enter: (node, parentNode) => {
                    if (parentNode.type === "root") {
                      viewBox = node.attributes.viewBox;
                    }
                  },
                },
              };
            },
          },
          {
            name: "removeSvg",
            fn: () => {
              return {
                element: {
                  exit: (node, parentNode) => {
                    if (node.name === "svg") {
                      const index = parentNode.children.indexOf(node);
                      parentNode.children.splice(index, 1, ...node.children);
                    }
                  },
                },
              };
            },
          },
        ],
      });

      const fileContents = Mustache.render(template, {
        svgElements: svgPaths.data,
        componentName,
        ariaLabel: iconTitle,
        viewBox: viewBox ?? "0 0 12 12",
      });

      const formattedResult = prettier.format(fileContents, {
        parser: "babel-ts",
        singleQuote: false,
        trailingComma: "none",
        printWidth: 80,
        proseWrap: "always",
      });

      fs.writeFileSync(newFileName, formattedResult, "utf8");
    });
  });
});
