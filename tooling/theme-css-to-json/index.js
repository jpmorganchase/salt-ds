const fs = require("fs");
const path = require("path");
const { findLast, generate, parse, walk } = require("css-tree");

// In the future this can be exposed to command arg
const cssVarPrefix = "--uitk-";
const prettyPrintOutputJson = true;
const splitFileByClass = true; // this would generate multiple JSON from a single CSS to avoid same token been overridden

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

/**
 * Trying to figure out the best description to describe the class combinations
 *
 * - `[.light, .dark]` => `both-themes`
 * - `[.light]` => `light`
 * - `[.low, .medium, .high, .touch]` => `all-densities`
 * - `[.low]` => `low`
 *
 * This is just an over simplified version....
 */
const getDescriptionFromClasses = (classes) => {
  if (classes.every((x) => /light|dark/.test(x))) {
    if (classes.length > 1) {
      return "both-themes";
    } else {
      if (/light|dark/.exec(classes[0])) {
        return /light|dark/.exec(classes[0])[0];
      } else {
        log("ERROR: ", classes[0], "no light dark?!");
      }
    }
  } else if (classes.every((x) => /low|medium|high|touch/.test(x))) {
    if (classes.length === 4) {
      return "all-densities";
    } else {
      return /low|medium|high|touch/.exec(classes[0])[0];
    }
  } else {
    return classes.join(",").replace(/\./g, "");
  }
};

const writeObjToFile = (obj, filePath) => {
  const filePathDir = path.dirname(filePath);
  // log({ filePath, filePathDir });

  if (!fs.existsSync(filePathDir)) {
    // Create dir if not exist
    // log("Creating new dir", filePathDir);
    fs.mkdirSync(filePathDir, { recursive: true });
  } else if (fs.existsSync(filePath)) {
    // delete existing file
    // log("Removed existing file", outputFilePath);
    fs.rmSync(filePath);
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(obj, null, prettyPrintOutputJson ? 2 : undefined),
    { flags: "a" }
  );
  log("Wrote to", filePath);
};

filesArg.forEach((inputFile) => {
  const inputFilePath = path.parse(inputFile);
  const outputFileDir = path.join(
    outputDir,
    path.basename(path.dirname(inputFile))
  );
  const outputFilePath = path.join(outputFileDir, inputFilePath.name + ".json");

  const css = fs.readFileSync(inputFile, "utf8");
  // log(css);
  const ast = parse(css);

  if (splitFileByClass) {
    walk(ast, {
      visit: "StyleSheet",
      enter(root) {
        root.children.forEach((node) => {
          if (node.type !== "Rule") {
            // e.g. skip @rule for animation
            return;
          }
          const classes = [];
          walk(node, {
            visit: "ClassSelector",
            enter(node) {
              // console.log(node);
              classes.push(node.name);
            },
          });
          const description = getDescriptionFromClasses(classes);
          // log({ classes, description });

          // Some way to identify the source of CSS
          const resultObj = { comment: `Generated from ${inputFile}` };

          walk(node, {
            visit: "Declaration",
            enter(node) {
              if (node.value.value) {
                const property = removePrefix(node.property.trim()).split("-");
                let value = node.value.value.trim();

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
            },
          });

          const outputFilePathParts = path.join(
            outputFileDir,
            inputFilePath.name + "-" + description + ".json"
          );

          writeObjToFile(resultObj, outputFilePathParts);
        });
      },
      leave(node) {
        return walk.skip;
      },
    });
  } else {
    const resultObjFull = {};

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

              writeObjValue(resultObjFull, property, value);
              // log(resultObj, property, value);
            } else {
              // find out what's the situation here
              // debugger;
            }
          }
        });
      },
    });

    writeObjToFile(resultObjFull, outputFilePath);
  }
});
