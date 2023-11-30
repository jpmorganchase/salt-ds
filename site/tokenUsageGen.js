const fs = require("fs");
const path = require("path");

const tokenUsages = {};

function getUsageFromDir(dirPath) {
  if (!dirPath.includes("__tests__")) {
    const cssVariableRegex = /(-{2}salt-[a-zA-Z0-9_-]+)\s*/g;

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
        stats.isFile() &&
        path.extname(file) === ".css" &&
        path.basename(file).includes(componentName)
      ) {
        // Process CSS files
        const cssContent = fs.readFileSync(filePath, "utf8");
        let match;

        while ((match = cssVariableRegex.exec(cssContent)) !== null) {
          const tokenFamily = match[1].replace("--salt-", "").split("-")[0];

          if (!tokenUsages[tokenFamily]) {
            tokenUsages[tokenFamily] = [componentName];
          } else if (!tokenUsages[tokenFamily].includes(componentName)) {
            tokenUsages[tokenFamily].push(componentName);
          }
        }
      }
    });
  }

  return tokenUsages;
}

for (var dir of ["core", "lab"]) {
  getUsageFromDir(path.resolve(__dirname, `../packages/${dir}/src`));
}

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
