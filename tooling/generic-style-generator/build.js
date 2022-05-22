const StyleDictionary = require("style-dictionary");

console.log("Build started...");
console.log("\n==============================================");

// REGISTER THE CUSTOM TRANSFORMS

const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

StyleDictionary.registerFormat({
  name: "uitk/css/themes",
  formatter: function ({ dictionary, file, options }) {
    const { outputReferences } = options;
    return (
      fileHeader({ file }) +
      ".uitk-light, .uitk-dark {\n" +
      formattedVariables({ format: "css", dictionary, outputReferences }) +
      "\n}\n"
    );
  },
});

StyleDictionary.registerFormat({
  name: "uitk/css/densities",
  formatter: function ({ dictionary, file, options }) {
    const { outputReferences } = options;
    return (
      fileHeader({ file }) +
      ".uitk-density-touch, .uitk-density-low, .uitk-density-medium, .uitk-density-high {\n" +
      formattedVariables({ format: "css", dictionary, outputReferences }) +
      "\n}\n"
    );
  },
});

// REGISTER THE CUSTOM TRANSFORM GROUPS

// if you want to see what a pre-defined group contains, uncomment the next line:
// console.log(StyleDictionary.transformGroup['group_name']);

StyleDictionary.registerTransformGroup({
  name: "uitk/css",
  // Only difference is using size/px not rem
  transforms: [
    "attribute/cti",
    "name/cti/kebab",
    "time/seconds",
    "content/icon",
    "size/px",
    "color/css",
  ],
});

// REGISTER THE CUSTOM FILTERS

const UITK_CHARACTERISTICS = [
  "accent",
  "actionable",
  "container",
  "delay",
  "disabled",
  "draggable",
  "droptarget",
  "editable",
  "focused",
  "measured",
  "navigable",
  "overlayable",
  "ratable",
  "selectable",
  "separable",
  "status",
  "taggable",
  "text",
];

StyleDictionary.registerFilter({
  name: "uitk/colors",
  matcher: function (token) {
    return (
      //   token.group === "color" ||
      token.attributes.category === "color" ||
      token.attributes.category === "palette" ||
      UITK_CHARACTERISTICS.includes(token.attributes.category)
    );
  },
});

// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
const StyleDictionaryExtended = StyleDictionary.extend(
  __dirname + "/config.json"
);

// FINALLY, BUILD ALL THE PLATFORMS
StyleDictionaryExtended.buildAllPlatforms();

console.log("\n==============================================");
console.log("\nBuild completed!");
