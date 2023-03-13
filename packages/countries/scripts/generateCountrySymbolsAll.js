/**
 * Regenerate index.js files based on the CountrySymbol components
 *
 * generates index.js in the components folder.
 */

const glob = require("glob");
const path = require("path");
const fs = require("fs");

// options is optional
const options = {};

const basePath = path.join(__dirname, "../src/components");

glob(
  path.join(basePath, "*.tsx").replace(/\\/g, "/"),
  options,
  function (er, fileNames) {
    // glob gives files in order so we don't need to sort

    const content = fileNames.map((filename) => {
      const filenameWithoutExtension = path.parse(filename).name;
      return `${filenameWithoutExtension},`;
    });

    const importsStatements =
      "import {\n" + content.join("\n") + `\n} from "@salt-ds/countries";\n\n`;
    const exportStatements =
      "export const allCountries = [" + content.join("\n") + "\n];\n";

    const prettier = require("prettier");
    const formattedResult = prettier.format(
      importsStatements + exportStatements,
      {
        parser: "babel-ts",
        singleQuote: false,
        trailingComma: "all",
        printWidth: 80,
        proseWrap: "always",
      }
    );

    const outputFile = path.join(basePath, "../../stories/countries.all.ts");
    console.log(`Writing ${outputFile}`);
    fs.writeFile(outputFile, formattedResult, "utf8", function (err) {
      if (err) return console.log(err);
    });
  }
);
