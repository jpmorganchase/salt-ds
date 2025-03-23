const csstree = require("css-tree");

// Sample CSS content
const cssContent = `
  .class1 {
    --color-primary: red;
    --color-secondary: blue;
  }
  .class1[data-theme="dark"] {
    --color-primary: black;
    --color-background: gray;
  }
  .class2 {
    --color-accent: green;
  }
  [data-theme="light"].class1 {
    --color-primary: white;
  }

  /*
TODO: discuss whether this should be an actual file, or should inline these values.
con: If we offer these values, then it could misleading that we're offering all these values
 */
.salt-theme.salt-theme-next {
  --salt-color-blue-200-40a: rgba(var(--salt-color-blue-200-rgb), 0.4);
  --salt-color-blue-300-40a: rgba(var(--salt-color-blue-300-rgb), 0.4);
  --salt-color-blue-400-40a: rgba(var(--salt-color-blue-400-rgb), 0.4);
  --salt-color-blue-500-40a: rgba(var(--salt-color-blue-500-rgb), 0.4);
  --salt-color-blue-600-40a: rgba(var(--salt-color-blue-600-rgb), 0.4);
  --salt-color-blue-700-40a: rgba(var(--salt-color-blue-700-rgb), 0.4);
  --salt-color-blue-800-40a: rgba(var(--salt-color-blue-800-rgb), 0.4);
  --salt-color-gray-300-10a: rgba(var(--salt-color-gray-300-rgb), 0.1);
  --salt-color-gray-300-40a: rgba(var(--salt-color-gray-300-rgb), 0.4);
  --salt-color-gray-400-40a: rgba(var(--salt-color-gray-400-rgb), 0.4);
  --salt-color-gray-500-10a: rgba(var(--salt-color-gray-500-rgb), 0.1);
  --salt-color-gray-500-40a: rgba(var(--salt-color-gray-500-rgb), 0.4);
  --salt-color-gray-600-40a: rgba(var(--salt-color-gray-600-rgb), 0.4);
  --salt-color-gray-700-10a: rgba(var(--salt-color-gray-700-rgb), 0.1);
  --salt-color-gray-700-40a: rgba(var(--salt-color-gray-700-rgb), 0.4);
  --salt-color-green-400-40a: rgba(var(--salt-color-green-400-rgb), 0.4);
  --salt-color-green-500-40a: rgba(var(--salt-color-green-500-rgb), 0.4);
  --salt-color-green-600-40a: rgba(var(--salt-color-green-600-rgb), 0.4);
  --salt-color-orange-400-40a: rgba(var(--salt-color-orange-400-rgb), 0.4);
  --salt-color-orange-500-40a: rgba(var(--salt-color-orange-500-rgb), 0.4);
  --salt-color-orange-600-40a: rgba(var(--salt-color-orange-600-rgb), 0.4);
  --salt-color-red-400-40a: rgba(var(--salt-color-red-400-rgb), 0.4);
  --salt-color-red-500-40a: rgba(var(--salt-color-red-500-rgb), 0.4);
  --salt-color-red-600-40a: rgba(var(--salt-color-red-600-rgb), 0.4);
  --salt-color-teal-200-40a: rgba(var(--salt-color-teal-200-rgb), 0.4);
  --salt-color-teal-300-40a: rgba(var(--salt-color-teal-300-rgb), 0.4);
  --salt-color-teal-400-40a: rgba(var(--salt-color-teal-400-rgb), 0.4);
  --salt-color-teal-500-40a: rgba(var(--salt-color-teal-500-rgb), 0.4);
  --salt-color-teal-600-40a: rgba(var(--salt-color-teal-600-rgb), 0.4);
  --salt-color-teal-700-40a: rgba(var(--salt-color-teal-700-rgb), 0.4);
  --salt-color-teal-800-40a: rgba(var(--salt-color-teal-800-rgb), 0.4);
  --salt-color-background-snow-40a: rgba(var(--salt-color-background-snow-rgb), 0.4);
  --salt-color-background-marble-40a: rgba(var(--salt-color-background-marble-rgb), 0.4);
  --salt-color-background-limestone-40a: rgba(var(--salt-color-background-limestone-rgb), 0.4);
  --salt-color-background-granite-40a: rgba(var(--salt-color-background-granite-rgb), 0.4);
  --salt-color-background-jet-40a: rgba(var(--salt-color-background-jet-rgb), 0.4);
  --salt-color-background-leather-40a: rgba(var(--salt-color-background-leather-rgb), 0.4);
}

`;

// Parse the CSS content into an AST
const ast = csstree.parse(cssContent);

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
// [{type: 'classname', value: 'class1'}, {type: 'data-attribute', value: {name: 'data-theme', value: 'light'}}]
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
          console.log({
            "selector.children.size": selector.children.size,
            "rules.length": rules.length,
          });
          if (
            selector.children.size !== rules.length ||
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

// Function to extract CSS variables for a given classname and data attribute
function extractCSSVariablesForClassAndData(ast, className, dataAttribute) {
  const variables = {};

  // Traverse the AST
  csstree.walk(ast, (node) => {
    if (node.type === "Rule" && node.prelude.type === "SelectorList") {
      // Check if the selector matches the given classname and data attribute
      const hasClassAndData = node.prelude.children.some((selector) => {
        let hasClass = false;
        let hasData = false;

        // Traverse the selector's children to check for class and data attribute
        for (const child of selector.children) {
          if (child.type === "ClassSelector" && child.name === className) {
            hasClass = true;
          }
          if (
            child.type === "AttributeSelector" &&
            child.name.name === dataAttribute.name &&
            child.value &&
            child.value.value === dataAttribute.value
          ) {
            hasData = true;
          }
        }

        return hasClass && hasData;
      });

      if (hasClassAndData) {
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

// Example usage: Extract CSS variables for `.class1` with `[data-theme="dark"]`
const className = "class1";
const dataAttribute = { name: "data-theme", value: "dark" };

const rules = [
  { type: "classname", value: "class1" },
  { type: "data-attribute", value: { name: "data-theme", value: "light" } },
];
const themeNextRules = [
  { type: "classname", value: "salt-theme" },
  { type: "classname", value: "salt-theme-next" },
  // { type: "data-attribute", value: { name: "data-theme", value: "light" } },
];
const cssVariables2 = extractCSSVariablesForMatchingRules(ast, rules);
console.log("extractCSSVariablesForMatchingRules", cssVariables2);

const cssVariables = extractCSSVariablesForClassAndData(
  ast,
  className,
  dataAttribute,
);

console.log("extractCSSVariablesForClassAndData", cssVariables);
// Output: { '--color-primary': 'black', '--color-background': 'gray' }
