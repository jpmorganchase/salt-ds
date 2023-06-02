"use strict";

module.exports = {
  "must-inject-css": {
    meta: {
      docs: {
        description: "must inject css",
      },
    },
    create: function (context) {
      return {
        ImportDeclaration: function (node) {
          const importPath = node.source.value;
          const importSpecifiers = node.specifiers;

          if (importPath.endsWith(".css") && importSpecifiers.length === 0) {
            context.report({
              node: node,
              message:
                "CSS imports must be assigned to a variable and then injected",
            });
          }
        },
      };
    },
  },
};
