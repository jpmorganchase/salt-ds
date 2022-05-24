const fs = require("fs");
const path = require("path");
const { findLast, generate, parse, walk } = require("css-tree");

// In the future this can be exposed to command arg
const cssVarPrefix = "--uitk-";
const prettyPrintOutputJson = true;

const filesArg = process.argv.slice(2);

const log = (...params) => {
  console.log(...params);
};

log("filesArg: ", filesArg);
const outputDir = path.join(__dirname, "dist");
log(outputDir);
// if (fs.existsSync(outputDir)) {
//   fs.rmdirSync(outputDir);
// }
// fs.mkdirSync(outputDir);

const removePrefix = (input) => input.replaceAll(cssVarPrefix, "");
/**
 * `var(--uitk-abc-def)` => `{abc.def}`
 */
const cssVarToReference = (input) =>
  "{" +
  removePrefix(input.replace(/(^.*\(|\).*$)/g, ""))
    .split("-")
    .join(".") +
  "}";

const writeObjValue = (target, objKeys, value) => {
  if (!Array.isArray(objKeys)) return target;

  if (objKeys.length > 1) {
    if (target[objKeys[0]] === undefined) {
      target[objKeys[0]] = {};
    }
    writeObjValue(target[objKeys[0]], objKeys.slice(1), value);
  } else {
    target[objKeys[0]] = {
      value,
    };
  }
};

filesArg.forEach((inputFile) => {
  const inputFilePath = path.parse(inputFile);
  const outputFileDir = path.join(
    outputDir,
    path.basename(path.dirname(inputFile))
  );
  const outputFilePath = path.join(outputFileDir, inputFilePath.name + ".json");

  if (!fs.existsSync(outputFileDir)) {
    // Create dir if not exist
    log("Creating new dir", outputFileDir);
    fs.mkdirSync(outputFileDir, { recursive: true });
  } else if (fs.existsSync(outputFilePath)) {
    // delete existing file
    // log("Removed existing file", outputFilePath);
    fs.rmSync(outputFilePath);
  }

  const resultObj = {};

  const css = fs.readFileSync(inputFile, "utf8");
  // log(css);
  const ast = parse(css);
  walk(ast, {
    visit: "Rule",
    enter(node) {
      const declarations = [];
      node.block.children.forEach((x) => {
        if (x.type === "Declaration") {
          if (x.value.value) {
            const property = removePrefix(x.property.trim()).split("-");
            let value = x.value.value.trim();

            if (value.startsWith("var")) {
              // variable reference
              value = cssVarToReference(value);
            } else if (value.startsWith("calc")) {
              // store the raw formular with prefix removed to be manually edited later
              value = removePrefix(value);
            } else {
              // raw value
              // do nothing
            }

            writeObjValue(resultObj, property, value);
            // log(resultObj, property, value);
          } else {
            // find out what's the situation here
            // debugger;
          }
        }
      });
    },
  });
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(resultObj, null, prettyPrintOutputJson ? 2 : undefined),
    { flags: "a" }
  );

  log("Wrote to", outputFilePath);
});
