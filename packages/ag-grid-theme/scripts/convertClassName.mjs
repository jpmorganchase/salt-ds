import { readFileSync, writeFileSync } from "node:fs";
import { clone, generate, parse, walk } from "css-tree";
import glob from "fast-glob";
import prettier from "prettier";

// const selectorToFind = `div[class*="${attributeToMatch}"]`;
const attributeToMatch = "ag-theme-salt";
const replacementClasses = [
  "ag-theme-salt-light",
  "ag-theme-salt-dark",
  "ag-theme-salt-compact-light",
  "ag-theme-salt-compact-dark",
];

let count = 0;

for (const file of glob.sync("packages/ag-grid-theme/css/parts/*.css")) {
  const cssContent = readFileSync(file, { encoding: "utf-8" });
  const ast = parse(cssContent);

  // Traverse and duplicate rules with attribute selectors
  walk(ast, (node, item, list) => {
    if (node.type === "Selector") {
      if (
        node.children.some(
          (child) =>
            child.type === "AttributeSelector" &&
            child.value.value === attributeToMatch,
        )
      ) {
        const copy1 = clone(node);
        const copy2 = clone(node);
        const copy3 = clone(node);
        list.insertData(copy1, item);
        list.insertData(copy2, item);
        list.insertData(copy3, item);
      }
    }
  });

  // replace attribute selector with class selector
  walk(ast, (node, item, list) => {
    if (
      node.type === "AttributeSelector" &&
      node.value.value === attributeToMatch
    ) {
      list.remove(item.prev);

      const newClassSelector = {
        type: "ClassSelector",
        name: replacementClasses[count % 4],
      };

      count++;

      // Insert the new class selector into the same list
      list.insertData(newClassSelector, item);
      list.remove(item);
    }
  });

  // Generate the modified CSS
  const modifiedCss = generate(ast);

  const prettierCss = await prettier.format(modifiedCss, { parser: "css" });

  // Save the modified CSS back to the file (or a new file)
  writeFileSync(file, prettierCss, { encoding: "utf-8" });
}
