const fs = require("node:fs");
const path = require("node:path");
const csstree = require("css-tree");

function matchSelectorRule(child, rule) {
  const { type, value } = rule;
  switch (type) {
    case "classname": {
      return child.type === "ClassSelector" && child.name === value;
    }
    case "data-attribute": {
      return (
        child.type === "AttributeSelector" &&
        child.name.name === value.name &&
        child.value &&
        child.value.value === value.value
      );
    }
    default: {
      console.warn("Unknown rule type", type);
      return false;
    }
  }
}

// Function to extract CSS variables for a given rules, e.g., matching classname, or data attribute
// example: [{type: 'classname', value: 'class1'}, {type: 'data-attribute', value: {name: 'data-theme', value: 'light'}}]
function extractCSSVariablesForMatchingRules(ast, rules) {
  const variables = {};

  // Traverse the AST
  csstree.walk(ast, (node) => {
    if (node.type === "Rule" && node.prelude.type === "SelectorList") {
      // Check if the selector matches the given classname and data attribute
      const selectorListChildren = node.prelude.children;
      // console.log({ selectorListChildren, size: selectorListChildren.size });
      const rulesMatched = selectorListChildren.some((selector) => {
        for (const rule of rules) {
          if (
            // matching selector with rule number
            selector.children.size !== rules.length ||
            // match selector in **any** order
            !selector.children.some((c) => matchSelectorRule(c, rule))
          ) {
            return false;
          }
        }

        return true;
      });

      if (rulesMatched) {
        // Traverse the declaration block to find CSS variables
        csstree.walk(node.block, (declaration) => {
          if (
            declaration.type === "Declaration" &&
            declaration.property.startsWith("--")
          ) {
            variables[declaration.property] = csstree.generate(
              declaration.value,
            );
          }
        });
      }
    }
  });

  return variables;
}

const THEME_RULES_MAP = {
  general: [{ type: "classname", value: "salt-theme" }],
  light: [
    { type: "classname", value: "salt-theme" },
    { type: "data-attribute", value: { name: "data-mode", value: "light" } },
  ],
  dark: [
    { type: "classname", value: "salt-theme" },
    { type: "data-attribute", value: { name: "data-mode", value: "dark" } },
  ],
  // .salt-density-touch,
  // .salt-density-low,
  // .salt-density-medium,
  // .salt-density-high
  high: [{ type: "classname", value: "salt-density-high" }],
  medium: [{ type: "classname", value: "salt-density-medium" }],
  low: [{ type: "classname", value: "salt-density-low" }],
  touch: [{ type: "classname", value: "salt-density-touch" }],
};

const THEME_NEXT_RULES_MAP = {
  general: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
  ],
  light: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
    { type: "data-attribute", value: { name: "data-mode", value: "light" } },
  ],
  dark: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
    { type: "data-attribute", value: { name: "data-mode", value: "dark" } },
  ],
  high: [
    { type: "classname", value: "salt-theme-next" },
    { type: "classname", value: "salt-density-high" },
  ],
  medium: [
    { type: "classname", value: "salt-theme-next" },
    { type: "classname", value: "salt-density-medium" },
  ],
  low: [
    { type: "classname", value: "salt-theme-next" },
    { type: "classname", value: "salt-density-low" },
  ],
  touch: [
    { type: "classname", value: "salt-theme-next" },
    { type: "classname", value: "salt-density-touch" },
  ],
  // .salt-theme.salt-theme-next[data-mode="light"][data-accent="blue"] {
  lightBlue: [
    { type: "classname", value: "salt-theme" },
    { type: "data-attribute", value: { name: "data-mode", value: "light" } },
    { type: "data-attribute", value: { name: "data-accent", value: "blue" } },
  ],
  darkBlue: [
    { type: "classname", value: "salt-theme" },
    { type: "data-attribute", value: { name: "data-mode", value: "dark" } },
    { type: "data-attribute", value: { name: "data-accent", value: "blue" } },
  ],
  lightTeal: [
    { type: "classname", value: "salt-theme" },
    { type: "data-attribute", value: { name: "data-mode", value: "light" } },
    { type: "data-attribute", value: { name: "data-accent", value: "teal" } },
  ],
  darkTeal: [
    { type: "classname", value: "salt-theme" },
    { type: "data-attribute", value: { name: "data-mode", value: "dark" } },
    { type: "data-attribute", value: { name: "data-accent", value: "teal" } },
  ],
  // .salt-theme-next[data-corner="rounded"]
  rounded: [
    { type: "classname", value: "salt-theme" },
    {
      type: "data-attribute",
      value: { name: "data-corner", value: "rounded" },
    },
  ],
  sharp: [
    { type: "classname", value: "salt-theme" },
    {
      type: "data-attribute",
      value: { name: "data-corner", value: "sharp" },
    },
  ],
  // .salt-theme-next.salt-theme[data-heading-font="Open Sans"]
  openSansHeading: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
    {
      type: "data-attribute",
      value: { name: "data-heading-font", value: "Open Sans" },
    },
  ],
  amplitudeHeading: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
    {
      type: "data-attribute",
      value: { name: "data-heading-font", value: "Amplitude" },
    },
  ],
  openSansAction: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
    {
      type: "data-attribute",
      value: { name: "data-action-font", value: "Open Sans" },
    },
  ],
  amplitudeAction: [
    { type: "classname", value: "salt-theme" },
    { type: "classname", value: "salt-theme-next" },
    {
      type: "data-attribute",
      value: { name: "data-action-font", value: "Amplitude" },
    },
  ],
};

/**
 * - Process all legacy theme files
 * - Process all theme next files, override values appeared already in legacy theme
 *
 * For each file, process it to return a list of grouped tokens, specifies which styling options
 * (or generic rules) it would match. e.g.
 * - `ClassSelector`, name = "salt-theme"
 * - `AttributeSelector` name.name = "data-mode", value.value = "light"
 *
 * Input: List of rules to be matched, use `findAll` to locate
 * Return a list of rules with token record <name: value>
 */
function processFileAst(filePath, cssVariables, themeNext) {
  // Process CSS files
  const ast = csstree.parse(fs.readFileSync(filePath, { encoding: "utf-8" }));

  for (const [key, rules] of Object.entries(
    themeNext ? THEME_NEXT_RULES_MAP : THEME_RULES_MAP,
  )) {
    cssVariables[key] = {
      ...cssVariables[key],
      ...extractCSSVariablesForMatchingRules(ast, rules),
    };
  }
}

module.exports = {
  fromDir: function getCssVariablesFromDir(
    dirPath,
    themeNext = false,
    ignoreDeprecated = true,
  ) {
    const cssVariables = {};
    // const lightModeVariables = {};
    // const darkModeVariables = {};
    // const hdVariables = {};
    // const mdVariables = {};
    // const ldVariables = {};
    // const tdVariables = {};
    // const openSansHeadingVariables = {};
    // const amplitudeHeadingVariables = {};
    // const openSansActionVariables = {};
    // const amplitudeActionVariables = {};
    // const roundedCornerVariables = {};
    // const sharpCornerVariables = {};
    const files = fs.readdirSync(dirPath);
    const dirFiles = files.map((file) => file.replace(".css", ""));
    const isFoundationsDir = dirPath.includes("foundations");

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileName = file.replace(".css", "");

      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        if (!ignoreDeprecated || !filePath.includes("deprecated")) {
          // Recursively process subdirectories
          Object.assign(cssVariables, getCssVariablesFromDir(filePath));
        } else {
          console.info("Skipping deprecated folder");
        }
      } else if (
        stats.isFile() &&
        path.extname(file) === ".css"
        // &&
        // ((isFoundationsDir && !dirFiles.includes(`${fileName}-next`)) ||
        //   (!isFoundationsDir && fileName.includes("-next")))
      ) {
        console.info("Processing", filePath);

        processFileAst(filePath, cssVariables, false);
        if (themeNext) {
          // process theme next tokens, if the same token exist, will be overridden
          processFileAst(filePath, cssVariables, true);
        }
      }
    }
    return cssVariables;
  },
};
