const path = require("node:path");

// Workspace components consume CSS as a string for style injection. Keep a
// native CSS import too so Next includes their styles in server-rendered pages.
module.exports = function saltCssLoader(source) {
  const stylesheet = `./${path.basename(this.resourcePath)}?salt-stylesheet`;
  return `import ${JSON.stringify(stylesheet)};\nexport default ${JSON.stringify(source)};\n`;
};
