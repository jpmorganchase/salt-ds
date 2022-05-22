/**
 * Generate SVG joined together for Figma plugin
 *
 * <span class="icon uitk-icon" draggable="true">
 *     <svg ...>
 * </span>
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const log = (...params) => {
  console.log(...params);
};

const fileArg = process.argv.splice(2).join("|");
// options is optional
const options = {};
const basePath = path.join(__dirname, "../src");

const globPath = path.join(basePath, `./SVG/+(${fileArg})`);
log({ globPath });

const templatePrefix = `<span class="icon uitk-icon" draggable="true">`;
const templateSuffix = `</span>`;

glob(globPath, options, function (error, filenames) {
  const newFileDir = path.join(basePath, "figma");
  const newFileName = path.join(newFileDir, "figmaIcons.html");

  if (!fs.existsSync(newFileDir)) {
    // Create dir if not exist
    log("Creating new dir", newFileDir);
    fs.mkdirSync(newFileDir, { recursive: true });
  } else if (fs.existsSync(newFileName)) {
    // delete existing file
    log("Removed existing file", newFileName);
    fs.rmSync(newFileName);
  }

  var stream = fs.createWriteStream(newFileName, { flags: "a" });

  filenames.forEach((fileName) => {
    const svgString = fs.readFileSync(fileName, "utf-8");

    stream.write(templatePrefix + "\n");
    stream.write(svgString + "\n");
    stream.write(templateSuffix + "\n");
  });

  stream.end();
  log("Wrote", filenames.length, "SVG to", newFileName);
});
