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
import path, { dirname } from "path";
import glob from "glob";
import prettier from "prettier";
import Mustache from "mustache";
import { convertSvgToJsx } from "@svgo/jsx";
import { optimize } from "svgo";
import { parseDocument, DomUtils } from "htmlparser2";
import { fileURLToPath } from "url";
import render from "dom-serializer";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

      const document = parseDocument(svgString);

      const svg = DomUtils.findOne(
        (node) => node.name === "svg",
        document.children,
        true
      );

      const svgElementString = render(svg.children);

      // SVGO is a separate step to enable multi-pass optimizations.
      const optimizedSvg = optimize(svgElementString, {
        plugins: [
          {
            name: "addAttributesToSVGElement",
            params: {
              attribute: { "data-testid": `${componentName}Icon` },
            },
          },
          {
            name: "preset-default",
            params: {
              overrides: {
                // makes icons scaled into width/height box
                removeViewBox: false,
              },
            },
          },
          { name: "removeXMLNS" },
          {
            name: "removeAttrs",
            params: {
              attrs: "(fill|width|height)",
            },
          },
        ],
        multipass: true,
      });

      const result = convertSvgToJsx({
        svg: optimizedSvg.data,
      });

      const optimizedSvgString = result.jsx;

      const fileContents = Mustache.render(template, {
        svgElements: optimizedSvgString,
        componentName,
        ariaLabel: iconTitle,
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
