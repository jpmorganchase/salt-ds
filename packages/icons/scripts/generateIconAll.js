/**
 * Regenerate index.js files based on the Icon components
 *
 * generates index.js in the components folder.
 */

const glob = require("glob");
const path = require("path");
const fs = require("fs");

// options is optional
const options = {};

const basePath = path.join(__dirname, "../src/components");

const transformCase = (str) => {
  return str
    .split("")
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? " " : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
};

glob(path.join(basePath, "*.tsx"), options, function (er, fileNames) {
  // glob gives files in order so we don't need to sort

  const importLines = fileNames.map((filename) => {
    const filenameWithoutExtension = path.parse(filename).name;
    return `${filenameWithoutExtension}Icon,`;
  });

  const importsStatements =
    "import {\n" +
    importLines.join("\n") +
    `\n} from "@jpmorganchase/uitk-icons";\n\n`;

  const exportLines = fileNames.map((filename) => {
    const filenameWithoutExtension = path.parse(filename).name;
    return `["${transformCase(
      filenameWithoutExtension
    )}", ${filenameWithoutExtension}Icon],`;
  });

  const exportStatements =
    "export const allIconNamePairs = [" +
    exportLines.join("\n") +
    "\n] as const;\n";

  const prettier = require("prettier");
  const formattedResult = prettier.format(
    importsStatements + exportStatements,
    {
      parser: "babel-ts",
      singleQuote: false,
      trailingComma: "none",
      printWidth: 80,
      proseWrap: "always",
    }
  );

  const outputFile = path.join(basePath, "../../stories/icon.all.ts");
  console.log(`Writing ${outputFile}`);
  fs.writeFile(outputFile, formattedResult, "utf8", function (err) {
    if (err) return console.log(err);
  });
});
