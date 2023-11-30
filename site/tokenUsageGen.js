const fs = require("fs");
const path = require("path");

/* Create object that will keep track of usage */
const tokenUsages = {};

function getUsageFromDir(dirPath) {
  if (!dirPath.includes("__tests__")) {
    const cssVariableRegex = /(-{2}salt-[a-zA-Z0-9_-]+)\s*/g;

    /* Get the name of the component we are testing */
    let componentName = dirPath.split("/").slice(-1)[0];
    componentName = componentName
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join("");

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Recursively process subdirectories
        Object.assign(tokenUsages, getUsageFromDir(filePath));
      } else if (
        /* Find only .css files where the component name is in the title,
         * e.g. match Button.css for button,
         * RadioButton.css and RadioButtonGroup.css for radio-button
         */
        stats.isFile() &&
        path.extname(file) === ".css" &&
        path.basename(file).includes(componentName)
      ) {
        const cssContent = fs.readFileSync(filePath, "utf8");
        let match;

        while ((match = cssVariableRegex.exec(cssContent)) !== null) {
          /* Get the token family name, e.g. 'actionable', 'container', 'size', 'zIndex' */
          const tokenFamily = match[1].replace("--salt-", "").split("-")[0];

          if (!tokenUsages[tokenFamily]) {
            /* Ensure we are tracking each family */
            tokenUsages[tokenFamily] = [componentName];
          } else if (!tokenUsages[tokenFamily].includes(componentName)) {
            /* Keep track that this component uses one of the tokens from this family */
            tokenUsages[tokenFamily].push(componentName);
          }
        }
      }
    });
  }

  return tokenUsages;
}

/* Recurse through core and lab components */
for (var dir of ["core", "lab"]) {
  getUsageFromDir(path.resolve(__dirname, `../packages/${dir}/src`));
}

/* Save output to this folder */
const jsonData = JSON.stringify(tokenUsages, null, 2);
const folderPath = path.resolve(
  __dirname,
  "../site/src/components/token-definitions"
);
const outputPath = path.join(folderPath, "usage.json");
try {
  fs.writeFileSync(outputPath, jsonData, "utf8");
} catch (err) {
  console.error("Error writing JSON file:", err);
}
