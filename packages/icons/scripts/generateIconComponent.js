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

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { optimize } = require("svgo");
const prettier = require("prettier");
const Mustache = require("mustache");
const htmlparser2 = require("htmlparser2");
const render = require("dom-serializer").default;

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
const globPath = path.join(basePath, `./SVG/+(${fileArg})`);
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

      let iconTitle = componentName;

      // Some icon svg contains `fill="#4c505b"` which will break CSS var styling
      const svgFillRemoved = svgString.replaceAll(
        new RegExp(`fill=\\"#\\w*\\"`, "g"),
        ""
      );

      const document = htmlparser2.parseDocument(svgFillRemoved);
      htmlparser2.DomUtils.find(
        (node) => {
          if (node.name === "title" && node.children.length > 0) {
            iconTitle = node.children[0].data.replace(/-/g, " ");
          }
        },
        document.children,
        true,
        1
      );

      const svg = htmlparser2.DomUtils.findOne(
        (node) => node.name === "svg",
        document.children,
        true
      );

      // It is unnecessary for inner svg elements or inside HTML documents.
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
      delete svg.attribs.xmlns;

      // `width` and `height` will be provided by CSS.
      // Also, if these exists, svgo will optimizes out `viewBox` which is more important for us
      delete svg.attribs.width;
      delete svg.attribs.height;

      svg.attribs["data-testid"] = `${componentName}Icon`;
      const svgOutput = render(svg);

      const result = optimize(svgOutput, {
        plugins: ["preset-default"],
        multipass: true,
      });
      const optimizedSvgString = result.data;

      const fileContents = Mustache.render(template, {
        svg: optimizedSvgString,
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
