const docgen = require("react-docgen-typescript");
const path = require("node:path");
// const { setTimeout } = require("node:timers/promises");
const { writeFile } = require("node:fs");
// const { writeFile } = require("node:fs/promises");

const componentPackages = [
  "lab",
  "core",
  "data-grid",
  "icons",
  "countries",
  "ag-grid-theme",
]; // Adding more packages here will generate additional prop files

console.log("Generating props in packages:", componentPackages);

const options = {
  propFilter: (prop) =>
    !/@types[\\/]react[\\/]/.test(prop.parent?.fileName || ""),
};
console.log(new Date(), "start");

const runPromise = () =>
  Promise.all(
    componentPackages.map((pkg) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(new Date(), pkg);
          const componentFile = path.join(
            __dirname,
            "..",
            "packages",
            pkg,
            "src",
            "index.ts",
          );
          const parsedDoc = docgen.parse(componentFile, options);
          const filePath = `./src/props/${pkg}-props.json`;
          console.log(new Date(), "parsedDoc", filePath);
          writeFile(filePath, JSON.stringify(parsedDoc, null, 2), (error) => {
            if (error) {
              console.log("An error has occurred ", error);
              reject(error);
            }
            console.log(`${filePath} successfully generated`);
            resolve();
          });
        }, 0);
      });
    }),
  );

runPromise()
  .then((text) => {
    console.log(new Date(), "end");

    console.log(text);
  })
  .catch((err) => {
    console.error(err);
  });

// console.log(new Date(), "start");

// const componentFiles = componentPackages.map((pkg) =>
//   path.join(__dirname, "..", "packages", pkg, "src", "index.ts"),
// );
// const components = componentFiles.map((component) => {
//   console.log(new Date(), "componentFiles.map", component);
//   return docgen.parse(component, options);
// });

// const filePaths = componentPackages.map(
//   (pkg) => `./src/props/${pkg}-props.json`,
// );

// components.forEach((component, index) =>
//   writeFile(filePaths[index], JSON.stringify(component, null, 2), (error) => {
//     if (error) {
//       console.log("An error has occurred ", error);
//       return;
//     }
//     console.log(`${filePaths[index]} successfully generated`);
//   }),
// );
