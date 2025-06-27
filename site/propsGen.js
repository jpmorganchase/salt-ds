const docgen = require("react-docgen-typescript");
const path = require("node:path");
const { writeFile } = require("node:fs");

const componentPackages = [
  "lab",
  "core",
  "data-grid",
  "icons",
  "countries",
  "ag-grid-theme",
  "react-resizable-panel-theme",
  "embla-carousel",
]; // Adding more packages here will generate additional prop files

console.log("Generating props in packages:", componentPackages);

const componentFiles = componentPackages.map((pkg) =>
  path.join(__dirname, "..", "packages", pkg, "src", "index.ts"),
);

const options = {
  propFilter: (prop) =>
    !/@types[\\/]react[\\/]/.test(prop.parent?.fileName || ""),
};

const components = componentFiles.map((component) =>
  docgen.parse(component, options),
);

const filePaths = componentPackages.map(
  (pkg) => `./src/props/${pkg}-props.json`,
);

components.forEach((component, index) =>
  writeFile(filePaths[index], JSON.stringify(component, null, 2), (error) => {
    if (error) {
      console.log("An error has occurred ", error);
      return;
    }
    console.log(`${filePaths[index]} successfully generated`);
  }),
);
