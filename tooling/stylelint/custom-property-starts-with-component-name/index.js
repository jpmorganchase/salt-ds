"use strict";

const valueParser = require("postcss-value-parser");
const stylelint = require("stylelint");

const { report, ruleMessages } = stylelint.utils;

// A few stylelint utils are not exported
// copied from https://github.com/stylelint/stylelint/tree/main/lib/utils

const isValueFunction = function isValueFunction(node) {
  return node.type === "function";
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

const ruleName = "uitk/custom-property-starts-with-component-name";

const messages = ruleMessages(ruleName, {
  expected: (pattern) =>
    `Local tokens should start with --componentName, CSS API variables should start with --uitkComponentName`, // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://uitk.pages.dev/?path=/story/documentation-styles-and-theming-characteristics-introduction--page",
};

const components = [
  "Accordion",
  "AppHeader",
  "Avatar",
  "Badge",
  "BorderLayout",
  "Breadcrumbs",
  "Button",
  "ButtonBar",
  "Calendar",
  "Card",
  "Carousel",
  "CascadingMenu",
  "Checkbox",
  "ColorChooser",
  "ComboBox",
  "ContactDetails",
  "ContentStatus",
  "ControlLabel",
  "DeckLayout",
  "Dialog",
  "Dropdown",
  "EditableLabel",
  "FileDropZone",
  "FlexLayout",
  "FlowLayout",
  "FormField",
  "FormGroup",
  "FormattedInput",
  "Grid",
  "GridLayout",
  "Icon",
  "Input",
  "LayerLayout",
  "LinearProgress",
  "Link",
  "List",
  "Logo",
  "MenuButton",
  "Metric",
  "Overlay",
  "Pagination",
  "Panel",
  "ParentChildLayout",
  "Pill",
  "Popper",
  "Portal",
  "QueryInput",
  "RadioButton",
  "Scrim",
  "SearchInput",
  "SkipLink",
  "Slider",
  "Spinner",
  "SplitLayout",
  "StackLayout",
  "StateIcon",
  "StepperInput",
  "Switch",
  "Tabs",
  "Tabstrip",
  "Text",
  "ToggleButton",
  "TokenizedInput",
  "Toolbar",
  "Tooltip",
  "Tree",
];

const componentsFormatted = components.map(
  (component) => `${component[0].toLowerCase()}${component.slice(1)}`
);

/**
 * Test whether a property value is component custom property
 *
 * Starts with `--componentName-`
 */
const isComponentCustomProperty = function (property) {
  return componentsFormatted.find((component) =>
    property.startsWith(`--${component}-`)
  );
};

/**
 * Test whether a property value is CSS API variables
 *
 * Starts with `--uitkComponentName-`
 */
const isCssApi = function (property) {
  return components.find((component) =>
    property.startsWith(`--uitk${component}-`)
  );
};

module.exports = stylelint.createPlugin(
  ruleName,
  (primary, secondaryOptionObject, context) => {
    let count = 0;
    return (root, result) => {
      const verboseLog = primary.logLevel === "verbose";

      function check(property) {
        const checkResult =
          isCssApi(property) ||
          isComponentCustomProperty(property) ||
          property.startsWith("--backwardsCompat-") ||     // Do not check backwardsCompat CSS
          property.startsWith("--svg-");   // FIXME: Do not check SVG tokens for now
        verboseLog && console.log("Checking", checkResult, property);
        return checkResult;
      }

      root.walkDecls((decl) => {
        if (
          decl.parent?.type === "rule" &&
          decl.parent?.selector?.includes?.("backwardsCompat")
        ) {
          // Do not check backwardsCompat CSS
          return;
        }

        const { prop, value } = decl;

        const parsedValue = valueParser(value);

        parsedValue.walk((node) => {
          if (!isValueFunction(node)) return;

          if (node.value.toLowerCase() !== "var") return;

          const { nodes } = node;

          const firstNode = nodes[0];

          verboseLog && console.log({ nodes });

          if (
            !firstNode ||
            firstNode.value.startsWith("--uitk-") ||
            !firstNode.value.startsWith("--") ||
            check(firstNode.value)
          )
            return;

          complain(
            declarationValueIndex(decl) + firstNode.sourceIndex,
            firstNode.value.length,
            decl
          );
        });

        verboseLog && console.log({ prop });

        if (!prop.startsWith("--") || prop.startsWith("--uitk-") || check(prop)) return;

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
  }
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
