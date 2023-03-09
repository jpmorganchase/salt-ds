"use strict";

const stylelint = require("stylelint");
const valueParser = require("postcss-value-parser");

const { report, ruleMessages } = stylelint.utils;

// A few stylelint utils are not exported
// copied from https://github.com/stylelint/stylelint/tree/main/lib/utils

const isValueClass = function isValueClass(node) {
  return node.type === "class";
};

const declarationValueIndex = function declarationValueIndex(decl) {
  const raws = decl.raws;

  return [
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop && raws.prop.prefix,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    (raws.prop && raws.prop.raw) || decl.prop,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop && raws.prop.suffix,
    raws.between || ":",
    // @ts-expect-error -- TS2339: Property 'prefix' does not exist on type '{ value: string; raw: string; }'.
    raws.value && raws.value.prefix,
  ].reduce((count, str) => {
    if (str) {
      return count + str.length;
    }

    return count;
  }, 0);
};

// ---- Start of plugin ----

const ruleName = "salt/classname-prop-is-last-in-clsx-order";

const messages = ruleMessages(ruleName, {
  expected: () =>
    `ClassName passed by props should always be the last item inside clsx() to ensure its higher specificity.`,
});

const meta = {
  type: "suggestion",
};

const ruleFunction = (primary, secondaryOptionObject, context) => {
  return (root, result) => {
    const verboseLog = primary.logLevel === "verbose";

    function check(property) {
      const checkResult =
        property.length <= 1 || property[property.length - 1] === "class";
      verboseLog && console.log("Checking", checkResult, property);
      return checkResult;
    }

    root.walkDecls((decl) => {
      const { prop, value } = decl;

      const parsedValue = valueParser(value);

      parsedValue.walk((node) => {
        if (!isValueClass(node)) return;

        const classList = node.value.split(/\s+/);
        if (check(classList)) return;

        complain(
          declarationValueIndex(decl) + node.sourceIndex,
          node.value.length,
          decl
        );
      });
      verboseLog && console.log({ prop });

      if (check(prop)) return;

      complain(0, prop.length, decl);
    });

    function complain(index, length, decl) {
      report({
        result,
        ruleName,
        message: messages.expected(primary),
        node: decl,
        index,
        endIndex: index + length,
      });
    }
  };
};

module.exports = stylelint.createPlugin(ruleName, ruleFunction);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
