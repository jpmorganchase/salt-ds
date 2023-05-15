const docgen = require("react-docgen-typescript");
const path = require("path");
const { writeFile } = require("fs");

const componentFiles = path.join(
  __dirname,
  "..",
  "packages",
  "core",
  "src",
  "index.ts"
);

const options = {
  propFilter: (prop) =>
    !/@types[\\/]react[\\/]/.test(prop.parent?.fileName || ""),
};

const components = docgen.parse(componentFiles, options);

const filePath = "./src/props/props.json";

writeFile(filePath, JSON.stringify(components, null, 2), (error) => {
  if (error) {
    console.log("An error has occurred ", error);
    return;
  }
  console.log("Component props successfully generated");
});
