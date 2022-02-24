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
console.log(globPath);
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
      const document = htmlparser2.parseDocument(svgString);
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
      svg.attribs["data-testid"] = `${componentName}Icon`;
      const svgOutput = render(document);

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
