const cssTree = require("css-tree");

const { findLast, generate, parse, walk } = cssTree;

const parseCSS = (contents, path) => {
  const classNames = {};
  const privateVariableMap = {};
  const identifierMap = {};
  const comments = {};

  const ast = parse(contents, {
    positions: true,
    parseValue: true,
    parseRulePrelude: true,
    parseCustomProperty: true,
    parseAtrulePrelude: true,
    onComment: (value, location) => {
      comments[location.end.line] = value.trim();
    },
  });

  walk(ast, {
    visit: "Selector",
    enter(node) {
      if (
        this.selector?.loc?.start.line &&
        comments[this.selector.loc.start.line - 1]
      ) {
        const name = generate(node);
        if (!comments[this.selector.loc.start.line - 1].includes("@ignore")) {
          classNames[name] = {
            name,
            description: comments[this.selector.loc.start.line - 1],
          };
        }
      }
    },
  });

  walk(ast, {
    visit: "Declaration",
    enter(node) {
      if (node.type === "Declaration") {
        if (node.property.startsWith("--")) {
          try {
            privateVariableMap[node.property] = {
              name: node.property,
              value: generate(
                findLast(node.value, (node) =>
                  valueTypes.includes(node.type)
                ) ?? node.value
              ),
            };
          } catch (e) {
            console.warn(
              e,
              `Encountered issue parsing CSS variable declaration "${node.property}" in "${path}"`
            );
          }
        }
      }
    },
  });

  walk(ast, {
    visit: "Identifier",
    enter(node) {
      const name = node.name;
      if (name.startsWith("--")) {
        try {
          identifierMap[name] = {
            name,
            property: this.declaration?.property,
            fallbackValue: this.declaration
              ? generate(
                  findLast(this.declaration, (node) =>
                    valueTypes.includes(node.type)
                  )
                )
              : undefined,
          };
        } catch (e) {
          console.warn(
            `Encountered issue parsing CSS variable "${name}" in "${path}"`
          );
        }
      }
    },
  });

  return { classNames };
};

module.exports = parseCSS;
