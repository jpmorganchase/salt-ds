/**
 *
 * Steps performed
 *
 * - Optimize SVG, https://github.com/svg/svgo
 *
 *   - Add `data-testid="Foo SVG"` to svg node
 *   - Export named component wrapped with CountrySymbol component
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
  let arr = str.split(" ");
  let capital = arr.map(
    (item) =>
      item.charAt(0).toLocaleUpperCase("en-US") +
      item.slice(1).toLocaleLowerCase("en-US")
  );

  return capital.join("");
}

const fileArg = process.argv.splice(2).join("|");
// options is optional
const options = {};
const basePath = path.join(__dirname, "../src");

if (!fs.existsSync(path.join(basePath, "./components/"))) {
  fs.mkdirSync(path.join(basePath, "./components/"));
}

const template = fs.readFileSync(
  path.join(__dirname, "./templateCountrySymbol.mustache"),
  "utf-8"
);
const globPath = path.join(basePath, `./SVG/+(${fileArg})`).replace(/\\/g, "/");
console.log("globPath", globPath);
glob(globPath, options, function (error, filenames) {
  filenames.forEach((fileName) => {
    fs.readFile(fileName, "utf-8", (error, svgString) => {
      if (error) throw error;

      const filenameWithoutExtension = path.parse(fileName).name;

      const firstSpaceIndex = filenameWithoutExtension.indexOf(" ");

      const baseCountryName = filenameWithoutExtension
        .slice(firstSpaceIndex)
        .trim();

      const countryCode = filenameWithoutExtension
        .slice(0, firstSpaceIndex)
        .toUpperCase();
      const countryName = filenameWithoutExtension
        .slice(firstSpaceIndex)
        .trim()
        .replaceAll(new RegExp("[(|)|.|\\-|,|'|\\[|\\]]", "g"), "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      const componentName = pascalCase(countryName);

      let viewBox;
      const newFileName = path.join(
        basePath,
        "./components/",
        componentName + ".tsx"
      );

      console.log("processing", fileName, "to", newFileName);

      // let iconTitle = filenameWithoutExtension
      //   .split("-")
      //   .join(" ")
      //   .toLowerCase();

      // SVGO is a separate step to enable multi-pass optimizations.
      const optimizedSvg = optimize(svgString, {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                // makes country symbols scaled into width/height box
                removeViewBox: false,
              },
            },
          },
          {
            name: "removeAttrs",
            params: {
              attrs: "(width|height)",
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
                      if (
                        node.name === "mask" &&
                        name === "style" &&
                        typeof value === "string" &&
                        value.includes("mask-type:")
                      ) {
                        newAttributes["mask-type"] = value.slice(10);
                      } else {
                        newAttributes[svgAttributeMap[name] || name] = value;
                      }
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
        ariaLabel: baseCountryName.toLowerCase(),
        viewBox: viewBox ?? "0 0 72 72",
      });

      const formattedResult = prettier.format(fileContents, {
        parser: "babel-ts",
        singleQuote: false,
        trailingComma: "none",
        printWidth: 80,
        proseWrap: "always",
      });

      fs.writeFileSync(newFileName, formattedResult, {
        encoding: "utf8",
      });
    });
  });
});
