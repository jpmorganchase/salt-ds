const fs = require("fs");
const path = require("path");

const uitkFile = path.resolve(__dirname, "../css/uitk/palette/*.css");
const saltFile = path.resolve(__dirname, "../css/salt/palette/*.css");

// Read the files
const oldCss = fs.readFileSync(uitkFile);
const nextCss = fs.readFileSync(saltFile);

// Extract tokens using regex
const extractTokens = (cssContent) => {
  const regex = /--salt-[a-zA-Z0-9-]+(?=:)/g;
  console.log(cssContent.toString());
  const matches = cssContent.toString().match(regex);
  return matches ? new Set(matches) : new Set();
};
const oldTokens = extractTokens(oldCss);
const nextTokens = extractTokens(nextCss);

console.log("Tokens in old CSS:", [...oldTokens]);
console.log("Tokens in next CSS:", [...nextTokens]);

// Find tokens in color.css but not in color-next.css
const missingTokens = [...oldTokens].filter((token) => !nextTokens.has(token));

// Find tokens in color-next.css but not in color.css
const missingInColor = [...nextTokens].filter((token) => !oldTokens.has(token));

console.log("Tokens missing in ..next.css:");
missingTokens.forEach((t) => console.log(t));

console.log("Tokens missing in ..old.css:");
missingInColor.forEach((t) => console.log(t));
