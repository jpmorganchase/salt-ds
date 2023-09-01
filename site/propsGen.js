const docgen = require("react-docgen-typescript");
const path = require("path");
const { writeFile } = require("fs");

const componentPackages = ["lab", "core", "data-grid", "icons"]; // Adding more packages here will generate additional prop files

console.log("Generating props in packages:", componentPackages);

const componentFiles = componentPackages.map((package) =>
  path.join(__dirname, "..", "packages", package, "src", "index.ts")
);

const options = {
  propFilter: (prop) =>
    !/@types[\\/]react[\\/]/.test(prop.parent?.fileName || ""),
};

const components = componentFiles.map((component) =>
  docgen.parse(component, options)
);

const filePaths = componentPackages.map(
  (package) => `./src/props/${package}-props.json`
);

components.forEach((component, index) =>
  writeFile(filePaths[index], JSON.stringify(component, null, 2), (error) => {
    if (error) {
      console.log("An error has occurred ", error);
      return;
    }
    console.log(`${filePaths[index]} successfully generated`);
  })
);
