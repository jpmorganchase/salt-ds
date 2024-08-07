import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Biome, Distribution } from "@biomejs/js-api";
import glob from "glob";
import Mustache from "mustache";
import { optimize } from "svgo";

import { svgAttributeMap } from "./svgAttributeMap.mjs";

const biome = await Biome.create({
  distribution: Distribution.NODE,
});

biome.applyConfiguration({
  organizeImports: {
    enabled: true,
  },
  formatter: {
    enabled: true,
    indentStyle: "space",
  },
});

const REPLACE_START = "$START";
const REPLACE_END = "$END";

const GENERATED_WARNING_COMMENT =
  "// WARNING: This file was generated by a script. Do not modify it manually\n\n";
const CSS_GENERATED_WARNING_COMMENT =
  "/** WARNING: This file was generated by a script. Do not modify it manually */\n\n";

function countryCodeToComponentName(countryCode) {
  return countryCode.replace(/-/g, "_");
}

// Create the folder for the CountrySymbolComponents
const generateComponentsFolder = (basePath) => {
  if (!fs.existsSync(path.join(basePath, "./components/"))) {
    fs.mkdirSync(path.join(basePath, "./components/"));
  }
};

/** Generate all country SVG as background image, in a single CSS */
const generateCssAsBg = ({ basePath, cssOutputPath, fileArg }) => {
  // options is optional
  const options = {};

  const globPath = path
    .join(basePath, `./SVG/+(${fileArg})`)
    .replace(/\\/g, "/");

  const fileNames = glob.sync(globPath, options);

  const countryCss = fileNames
    .map((fileName) => {
      const svgString = fs
        .readFileSync(fileName, "utf-8")
        .trim()
        .replaceAll(/\r?\n|\r/g, "");

      const filenameWithoutExtension = path.parse(fileName).name;

      const firstSpaceIndex = filenameWithoutExtension.indexOf(" ");

      const countryCode = filenameWithoutExtension
        .slice(0, firstSpaceIndex)
        .toUpperCase();

      return `.saltCountry-${countryCode}{background-image:url("data:image/svg+xml,${encodeURIComponent(
        svgString,
      )}")}`;
    })
    .join("\n");

  const ALL_CSS = `[class*=' saltCountry-'],[class^='saltCountry-'] {background-size: cover;height:var(--salt-size-base, 20px);width:var(--salt-size-base, 20px);}\n`;

  const formattedResult = biome.formatContent(
    CSS_GENERATED_WARNING_COMMENT.concat(ALL_CSS, countryCss),
    { filePath: cssOutputPath },
  );

  fs.writeFileSync(cssOutputPath, formattedResult.content, {
    encoding: "utf8",
  });
};

/** Generate all sharp country SVG as background image, in a single CSS */
const generateSharpCssAsBg = ({ basePath, cssOutputPath, fileArg }) => {
  // options is optional
  const options = {};

  const globPath = path
    .join(basePath, `./SVG/sharp/+(${fileArg})`)
    .replace(/\\/g, "/");

  const fileNames = glob.sync(globPath, options);

  const countryCss = fileNames
    .map((fileName) => {
      const svgString = fs
        .readFileSync(fileName, "utf-8")
        .trim()
        .replaceAll(/\r?\n|\r/g, "");

      const countryCode = path.parse(fileName).name.toUpperCase();

      return `.saltCountrySharp-${countryCode}{background-image:url("data:image/svg+xml,${encodeURIComponent(
        svgString,
      )}")}`;
    })
    .join("\n");

  const ALL_CSS = `[class*=' saltCountrySharp-'],[class^='saltCountrySharp-'] {background-size: cover;height:var(--salt-size-base, 20px);width:calc(var(--salt-size-base, 20px) * 1.44);}\n`;

  const formattedResult = biome.formatContent(
    CSS_GENERATED_WARNING_COMMENT.concat(ALL_CSS, countryCss),
    { filePath: cssOutputPath },
  );

  fs.writeFileSync(cssOutputPath, formattedResult.content, {
    encoding: "utf8",
  });
};

// Generate all the country symbol components
const generateCountrySymbolComponents = ({
  templatePath,
  basePath,
  componentsPath,
  fileArg,
}) => {
  const countryMetaMap = {};

  // options is optional
  const options = {};

  const template = fs.readFileSync(templatePath, "utf-8");
  const globPath = path
    .join(basePath, `./SVG/+(${fileArg})`)
    .replace(/\\/g, "/");

  const fileNames = glob.sync(globPath, options);

  for (const fileName of fileNames) {
    const svgString = fs.readFileSync(fileName, "utf-8");

    const filenameWithoutExtension = path.parse(fileName).name;

    const firstSpaceIndex = filenameWithoutExtension.indexOf(" ");

    const countryCode = filenameWithoutExtension
      .slice(0, firstSpaceIndex)
      .toUpperCase();

    // Use country code to get the sharp (a.k.a. rectangular) version of the SVG
    const globPathSharp = path
      .join(basePath, `./SVG/sharp/${countryCode}.svg`)
      .replace(/\\/g, "/");

    const sharpSvgString = fs.readFileSync(globPathSharp, "utf-8");

    const countryName = filenameWithoutExtension.slice(firstSpaceIndex).trim();

    let viewBox;
    let sharpViewBox;

    const newFilePath = path.join(componentsPath, `${countryCode}.tsx`);
    const newSharpFilePath = path.join(
      componentsPath,
      `${countryCode}_Sharp.tsx`,
    );

    countryMetaMap[countryCode] = {
      countryCode,
      countryName,
    };

    console.log("processing", fileName, "to", newFilePath);

    // SVGO is a separate step to enable multi-pass optimizations.
    const optimizeOptions = {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              // makes country symbol scaled into width/height box
              removeViewBox: false,
            },
          },
        },
        {
          name: "removeAttrs",
          params: {
            attrs: "(width|height)",
          },
        },
      ],
    };

    const optimizedSvg = optimize(svgString, optimizeOptions);
    const optimizedSharpSvg = optimize(sharpSvgString, optimizeOptions);

    const getUidString = (countryCode, value) => {
      return `\$\{uid\}-${countryCode}-${value}`;
    };

    const optimizePlugins = {
      mapHTMLAttributesToReactProps: {
        name: "mapHTMLAttributesToReactProps",
        fn: () => {
          return {
            element: {
              enter: (node) => {
                const newAttributes = {};
                // preserve an order of attributes
                for (const [name, value] of Object.entries(node.attributes)) {
                  if (node.name === "mask") {
                    // convert style="mask-type:... to style={{ maskType: ... }} "
                    if (
                      name === "style" &&
                      typeof value === "string" &&
                      value.includes("mask-type:")
                    ) {
                      newAttributes.style = `${REPLACE_START}{{ maskType: '${value.slice(
                        10,
                      )}' }}${REPLACE_END}`;
                      // Allow each component instance to use unique ids for masks
                    } else if (name === "id") {
                      newAttributes[svgAttributeMap[name] || name] =
                        `${REPLACE_START}{\`${getUidString(
                          countryCode,
                          value,
                        )}\`}${REPLACE_END}`;
                    } else {
                      newAttributes[svgAttributeMap[name] || name] = value;
                    }
                  } else if (name === "mask") {
                    // Reference the unique mask Ids in the url for the mask attribute
                    const maskId = value
                      .replace("url(", "")
                      .replace(")", "")
                      .replace("#", "");

                    const newValue = `${REPLACE_START}{\`url(#${getUidString(
                      countryCode,
                      maskId,
                    )})\`}${REPLACE_END}`;

                    newAttributes[svgAttributeMap[name] || name] = newValue;
                  } else {
                    // Everything else
                    newAttributes[svgAttributeMap[name] || name] = value;
                  }
                }
                node.attributes = newAttributes;
              },
            },
          };
        },
      },
      removeSvg: {
        name: "removeSvg",
        fn: () => {
          return {
            element: {
              exit: (node, parentNode) => {
                if (node.name === "svg") {
                  const index = parentNode.children.indexOf(node);
                  parentNode.children.splice(index, 1, ...node.children);
                }
              },
            },
          };
        },
      },
    };

    const svgPaths = optimize(optimizedSvg.data, {
      plugins: [
        optimizePlugins.mapHTMLAttributesToReactProps,
        {
          name: "find-viewBox",
          fn: () => {
            return {
              element: {
                enter: (node, parentNode) => {
                  if (parentNode.type === "root") {
                    viewBox = node.attributes.viewBox;
                  }
                },
              },
            };
          },
        },
        optimizePlugins.removeSvg,
      ],
    });
    const sharpSvgPaths = optimize(optimizedSharpSvg.data, {
      plugins: [
        optimizePlugins.mapHTMLAttributesToReactProps,
        {
          name: "find-viewBox",
          fn: () => {
            return {
              element: {
                enter: (node, parentNode) => {
                  if (parentNode.type === "root") {
                    sharpViewBox = node.attributes.viewBox;
                  }
                },
              },
            };
          },
        },
        optimizePlugins.removeSvg,
      ],
    });

    const fileContents = Mustache.render(template, {
      svgElements: svgPaths.data,
      componentName: countryCodeToComponentName(countryCode),
      ariaLabel: countryName,
      viewBox: viewBox ?? "0 0 72 72",
      sharp: false,
    });
    const sharpFileContents = Mustache.render(template, {
      svgElements: sharpSvgPaths.data,
      componentName: `${countryCodeToComponentName(countryCode)}_Sharp`,
      ariaLabel: countryName,
      viewBox: sharpViewBox ?? "0 0 72 50",
      sharp: true,
    });

    const replacedText = fileContents
      .replaceAll(`"${REPLACE_START}`, "")
      .replaceAll(`${REPLACE_END}"`, "");

    const replacedSharpText = sharpFileContents
      .replaceAll(`"${REPLACE_START}`, "")
      .replaceAll(`${REPLACE_END}"`, "");

    const formattedResult = biome.formatContent(
      GENERATED_WARNING_COMMENT.concat(replacedText),
      { filePath: newFilePath },
    );

    const formattedSharpResult = biome.formatContent(
      GENERATED_WARNING_COMMENT.concat(replacedSharpText),
      { filePath: newSharpFilePath },
    );

    fs.writeFileSync(newFilePath, formattedResult.content, {
      encoding: "utf8",
    });
    fs.writeFileSync(newSharpFilePath, formattedSharpResult.content, {
      encoding: "utf8",
    });
  }

  return countryMetaMap;
};

// Generate the index file to export the CountrySymbol components
const generateIndex = ({ countryMetaMap, componentsPath }) => {
  console.log("Generating index file");

  const content = Object.values(countryMetaMap)
    .sort((a, b) => a.fileName - b.fileName)
    .map((countryMeta) => {
      const componentName = countryCodeToComponentName(countryMeta.countryCode);
      const defaultExport = `export { default as ${componentName} } from './${countryMeta.countryCode}';`;
      const sharpExport = `export { default as ${componentName}_Sharp } from './${countryMeta.countryCode}_Sharp';`;
      return [defaultExport, sharpExport].join("\n");
    });

  const contentWithMetaExport = [...content];

  const joinedText = [GENERATED_WARNING_COMMENT, ...contentWithMetaExport].join(
    "\n",
  );

  const outputFile = path.join(componentsPath, "index.ts");

  const formattedResult = biome.formatContent(joinedText, {
    filePath: outputFile,
  });

  console.log("creating index at:", outputFile);

  fs.writeFileSync(outputFile, formattedResult.content, { encoding: "utf8" });
};

// Generate countryMetaMap for use in stories and by consumers to map code to countryMeta
const generateCountryMetaMap = ({ countryMetaMap, basePath }) => {
  console.log("Generating countryMetaMap file");

  const outputFile = path.join(basePath, "countryMetaMap.ts");

  let metaText = ["export const countryMetaMap = {"];

  for (const code in countryMetaMap) {
    const countryMeta = countryMetaMap[code];

    const entryText = `"${code}": {
      countryCode: "${countryMeta.countryCode}",
      countryName: "${countryMeta.countryName}",
    },`;

    metaText = [...metaText, entryText];
  }

  const endText = `
  } as const;

  export type CountryCode = keyof typeof countryMetaMap;
  `;

  const joinedText = [
    GENERATED_WARNING_COMMENT,
    metaText.join("\n"),
    endText,
  ].join("\n");

  const formattedResult = biome.formatContent(joinedText, {
    filePath: outputFile,
  });

  fs.writeFileSync(outputFile, formattedResult.content, { encoding: "utf8" });
};

// generate lazyMap for use in the LazyCountrySymbol component
const generateLazyMap = ({ countryMetaMap, basePath }) => {
  console.log("Generating lazyMap file");

  const outputFile = path.join(
    basePath,
    "./lazy-country-symbol/",
    "lazyMap.ts",
  );

  const importText = `
    import { lazy } from "react";
  `;

  let lazyMapText = ["export const lazyMap = {"];

  for (const code in countryMetaMap) {
    const entryText = `"${code}": lazy(() => import("../components/${code}")),`;
    const sharpEntryText = `"${code}_Sharp": lazy(() => import("../components/${code}_Sharp")),`;

    lazyMapText = [...lazyMapText, entryText, sharpEntryText];
  }

  lazyMapText.push("} as const");

  const joinedText = [
    GENERATED_WARNING_COMMENT,
    importText,
    lazyMapText.join("\n"),
  ].join("\n");

  const formattedResult = biome.formatContent(joinedText, {
    filePath: outputFile,
  });

  fs.writeFileSync(outputFile, formattedResult.content, { encoding: "utf8" });
};

// Run the script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "../src");
const componentsPath = path.join(basePath, "./components/");
const templatePath = path.join(__dirname, "./templateCountrySymbol.mustache");
const cssOutputPath = path.join(__dirname, "../saltCountries.css");
const sharpCssOutputPath = path.join(__dirname, "../saltSharpCountries.css");
const fileArg = process.argv.splice(2).join("|");

generateComponentsFolder(basePath);
const countryMetaMap = generateCountrySymbolComponents({
  templatePath,
  componentsPath,
  basePath,
  fileArg,
});
generateCssAsBg({
  basePath,
  cssOutputPath,
  fileArg,
});
generateSharpCssAsBg({
  basePath,
  cssOutputPath: sharpCssOutputPath,
  fileArg,
});
generateCountryMetaMap({ countryMetaMap, basePath });
generateLazyMap({ countryMetaMap, basePath });
generateIndex({ countryMetaMap, componentsPath });
