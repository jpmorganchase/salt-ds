import fs from "node:fs";
import path from "node:path";
import { argv } from "node:process";

import { formatCommercialTheme } from "./format-commercial-theme.mjs";

const [lightTokensPath, darkTokensPath, colorTokensPath] = argv.slice(2);

if (!lightTokensPath || !darkTokensPath || !colorTokensPath) {
  throw new Error(
    "Usage: node scripts/generate-commercial-theme.mjs <light-tokens.json> <dark-tokens.json> <color-tokens.json>",
  );
}

const cssPath = path.resolve("src/css");
const nextThemePath = path.join(cssPath, "next");
const commercialThemePath = path.join(cssPath, "commercial");
const outputPath = path.join(cssPath, "commercial.css");
const generatedComment =
  "/* Generated from the commercial Figma token exports. */";

const codeSyntaxCorrections = new Map([
  ["editable/tertiary-background", "--salt-editable-tertiary-background"],
  [
    "editable/tertiary-background-disabled",
    "--salt-editable-tertiary-background-disabled",
  ],
  ["actionable/background-selected", "--salt-actionable-background-selected"],
  ["actionable/border-selected", "--salt-actionable-borderColor-selected"],
  ["actionable/foreground-selected", "--salt-actionable-foreground-selected"],
  [
    "actionable/negative/background-selected",
    "--salt-actionable-negative-background-selected",
  ],
  [
    "actionable/negative/border-selected",
    "--salt-actionable-negative-borderColor-selected",
  ],
  [
    "actionable/negative/foreground-selected",
    "--salt-actionable-negative-foreground-selected",
  ],
  [
    "actionable/accented/background-selected",
    "--salt-actionable-accented-background-selected",
  ],
  [
    "actionable/accented/border-selected",
    "--salt-actionable-accented-borderColor-selected",
  ],
  [
    "actionable/accented/foreground-selected",
    "--salt-actionable-accented-foreground-selected",
  ],
  [
    "actionable/caution/background-selected",
    "--salt-actionable-caution-background-selected",
  ],
  [
    "actionable/caution/border-selected",
    "--salt-actionable-caution-borderColor-selected",
  ],
  [
    "actionable/caution/foreground-selected",
    "--salt-actionable-caution-foreground-selected",
  ],
  [
    "actionable/positive/background-selected",
    "--salt-actionable-positive-background-selected",
  ],
  [
    "actionable/positive/border-selected",
    "--salt-actionable-positive-borderColor-selected",
  ],
  [
    "actionable/positive/foreground-selected",
    "--salt-actionable-positive-foreground-selected",
  ],
  ["text/label-fontWeight-small", "--salt-text-label-fontWeight-small"],
  ["text/label-fontWeight-strong", "--salt-text-label-fontWeight-strong"],
  ["overlayable/background-hover", "--salt-overlayable-background-hover"],
  ["focused/onSolid-Outline", "--salt-focused-onSolid-outlineColor"],
  ["focused/Outline", "--salt-focused-outlineColor"],
]);

const paletteVariableCorrections = new Map([
  ["--salt-container-borderColor", "--salt-palette-alpha-contrast-medium"],
  [
    "--salt-container-subtle-borderColor",
    "--salt-palette-alpha-contrast-medium",
  ],
  ["--salt-selectable-background-selected", "--salt-palette-accent-selected"],
  ["--salt-category-1-dataviz", "--salt-palette-categorical-1-dataviz"],
  ["--salt-actionable-bold-background-hover", "--salt-palette-neutral-hover"],
  [
    "--salt-actionable-negative-bold-background-hover",
    "--salt-palette-negative-hover",
  ],
  [
    "--salt-actionable-accented-bold-background-hover",
    "--salt-palette-accent-hover",
  ],
  [
    "--salt-actionable-caution-bold-background-hover",
    "--salt-palette-warning-hover",
  ],
  [
    "--salt-actionable-positive-bold-background-hover",
    "--salt-palette-positive-hover",
  ],
]);

function readTokens(filePath) {
  return collectTokens(
    JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8")),
  );
}

function collectTokens(value, tokenPath = [], tokens = []) {
  for (const [name, child] of Object.entries(value)) {
    if (name.startsWith("$")) {
      continue;
    }

    const currentPath = [...tokenPath, name];

    if (
      child &&
      typeof child === "object" &&
      "$type" in child &&
      "$value" in child
    ) {
      tokens.push({
        path: currentPath.join("/"),
        ...child,
      });
    } else if (child && typeof child === "object" && !Array.isArray(child)) {
      collectTokens(child, currentPath, tokens);
    }
  }

  return tokens;
}

function sanitizeName(name) {
  return name.replaceAll("/", "-").replaceAll("+", "-").replaceAll(" ", "-");
}

function colorVariableName(targetName) {
  const segments = targetName.split("/");

  if (["alpha", "colors+alpha", "shared"].includes(segments[0])) {
    segments.shift();
  }

  const name = sanitizeName(segments.join("/")).replace(
    /-(\d+a)-(?:transparent|lowest|lower|low|mediumLow|medium|mediumHigh|high|higher|highest)$/,
    "-$1",
  );

  return `--salt-color-${name}`;
}

function codeSyntaxVariableName(token) {
  const correction = codeSyntaxCorrections.get(token.path);

  if (correction) {
    return correction;
  }

  const codeSyntax = token.$extensions?.["com.figma.codeSyntax"]?.WEB;

  if (!codeSyntax) {
    return undefined;
  }

  const variableMatch = codeSyntax.match(/^var\((--[\w-]+)\)$/);
  const customPropertyMatch = codeSyntax.match(/^(--[\w-]+)$/);

  if (variableMatch || customPropertyMatch) {
    return (variableMatch ?? customPropertyMatch)[1];
  }

  if (token.path.startsWith("FIGMA ONLY/")) {
    return undefined;
  }

  throw new Error(
    `Unsupported WEB codeSyntax "${codeSyntax}" for token "${token.path}"`,
  );
}

function aliasValue(aliasData) {
  const { targetVariableName, targetVariableSetName } = aliasData;

  switch (targetVariableSetName) {
    case "Colors":
      return `var(${colorVariableName(targetVariableName)})`;
    case "Density":
      return `var(--salt-${sanitizeName(targetVariableName)})`;
    case "Foundation - Color":
      return `var(--salt-color-${sanitizeName(targetVariableName)})`;
    case "Foundation - Typography":
      return `var(--salt-typography-${sanitizeName(targetVariableName)})`;
    case "Palette - J.P. Morgan": {
      const [, ...palettePath] = targetVariableName.split("/");
      return `var(--salt-palette-${sanitizeName(palettePath.join("/"))})`;
    }
    default:
      throw new Error(
        `Unsupported alias target set "${targetVariableSetName}"`,
      );
  }
}

function colorChannels(value) {
  if (value.colorSpace !== "srgb") {
    throw new Error(`Unsupported color space "${value.colorSpace}"`);
  }

  return value.components.map((component) => Math.round(component * 255));
}

function colorValue(value) {
  const [red, green, blue] = colorChannels(value);
  const alpha = Number(value.alpha.toFixed(3));

  return alpha === 1
    ? `rgb(${red}, ${green}, ${blue})`
    : `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function tokenValue(token) {
  const aliasData = token.$extensions?.["com.figma.aliasData"];

  if (aliasData) {
    return aliasValue(aliasData);
  }

  switch (token.$type) {
    case "color":
      return colorValue(token.$value);
    case "number":
      return String(token.$value);
    case "string":
      return JSON.stringify(token.$value);
    default:
      throw new Error(
        `Unsupported token type "${token.$type}" for token "${token.path}"`,
      );
  }
}

function declarations(tokens) {
  const result = new Map();

  for (const token of tokens) {
    const variableName = codeSyntaxVariableName(token);

    if (variableName) {
      if (result.has(variableName)) {
        throw new Error(
          `Duplicate WEB codeSyntax variable "${variableName}" after corrections`,
        );
      }

      result.set(variableName, {
        path: token.path,
        token,
        value: tokenValue(token),
      });
    }
  }

  return result;
}

function readNextCharacteristicValues() {
  const result = new Map();
  const characteristicsPath = path.join(nextThemePath, "characteristics");

  for (const fileName of fs.readdirSync(characteristicsPath)) {
    const css = fs.readFileSync(
      path.join(characteristicsPath, fileName),
      "utf8",
    );

    for (const match of css.matchAll(/(--salt-[\w-]+):\s*([^;]+);/g)) {
      result.set(match[1], match[2].trim());
    }
  }

  return result;
}

function paletteVariableFor(variableName, token, characteristicValues) {
  const aliasData = token.$extensions?.["com.figma.aliasData"];

  if (aliasData?.targetVariableSetName === "Palette - J.P. Morgan") {
    return tokenValue(token).slice(4, -1);
  }

  const correction = paletteVariableCorrections.get(variableName);

  if (correction) {
    return correction;
  }

  const currentValue = characteristicValues.get(variableName);
  const currentPalette = currentValue?.match(
    /^var\((--salt-palette-[\w-]+)\)$/,
  )?.[1];

  if (currentPalette) {
    return currentPalette;
  }

  if (currentValue === "var(--salt-color-transparent)") {
    return "--salt-palette-transparent";
  }

  throw new Error(
    `No palette mapping exists for color characteristic "${variableName}"`,
  );
}

function addPaletteDeclaration(declarations, variableName, value, sourcePath) {
  const existing = declarations.get(variableName);

  if (existing && existing.value !== value) {
    throw new Error(
      `Palette variable "${variableName}" maps to both "${existing.value}" and "${value}" (${existing.path}, ${sourcePath})`,
    );
  }

  declarations.set(variableName, { path: sourcePath, value });
}

function createThemeLayers(light, dark, characteristicValues) {
  const semanticLight = new Map();
  const semanticDark = new Map();
  const paletteLight = new Map();
  const paletteDark = new Map();

  for (const [variableName, lightDeclaration] of light) {
    const darkDeclaration = dark.get(variableName);

    if (!darkDeclaration) {
      throw new Error(`Dark export is missing "${variableName}"`);
    }

    if (lightDeclaration.token.$type !== "color") {
      semanticLight.set(variableName, lightDeclaration);
      semanticDark.set(variableName, darkDeclaration);
      continue;
    }

    const paletteVariable = paletteVariableFor(
      variableName,
      lightDeclaration.token,
      characteristicValues,
    );
    const semanticValue = `var(${paletteVariable})`;

    semanticLight.set(variableName, {
      path: lightDeclaration.path,
      value: semanticValue,
    });
    semanticDark.set(variableName, {
      path: darkDeclaration.path,
      value: semanticValue,
    });

    const lightAlias =
      lightDeclaration.token.$extensions?.["com.figma.aliasData"];
    const darkAlias =
      darkDeclaration.token.$extensions?.["com.figma.aliasData"];

    if (
      lightAlias?.targetVariableSetName === "Palette - J.P. Morgan" ||
      darkAlias?.targetVariableSetName === "Palette - J.P. Morgan"
    ) {
      if (
        lightAlias?.targetVariableSetName !== "Palette - J.P. Morgan" ||
        darkAlias?.targetVariableSetName !== "Palette - J.P. Morgan"
      ) {
        throw new Error(
          `Palette alias differs between modes for "${variableName}"`,
        );
      }

      continue;
    }

    if (!lightAlias || !darkAlias) {
      throw new Error(
        `Color characteristic "${variableName}" must reference an alias`,
      );
    }

    addPaletteDeclaration(
      paletteLight,
      paletteVariable,
      lightDeclaration.value,
      lightDeclaration.path,
    );
    addPaletteDeclaration(
      paletteDark,
      paletteVariable,
      darkDeclaration.value,
      darkDeclaration.path,
    );
  }

  return {
    paletteDark,
    paletteLight,
    semanticDark,
    semanticLight,
  };
}

function removeDeclarations(css, variableNames) {
  return css
    .split("\n")
    .filter((line) => {
      const property = line.match(/^\s+(--[\w-]+):/)?.[1];
      return !property || !variableNames.has(property);
    })
    .join("\n")
    .replace(/^[^{\n]+\{\s*\}\n?/gm, "");
}

function writeGeneratedFile(filePath, css) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${generatedComment}\n${css.trim()}\n`);
}

function copyNextThemeFiles(exportedVariableNames) {
  for (const directory of ["foundations", "palette", "characteristics"]) {
    const sourceDirectory = path.join(nextThemePath, directory);

    for (const fileName of fs.readdirSync(sourceDirectory)) {
      if (directory === "foundations" && fileName === "color.css") {
        continue;
      }

      const sourcePath = path.join(sourceDirectory, fileName);
      const destinationPath = path.join(
        commercialThemePath,
        directory,
        fileName,
      );
      const source = fs
        .readFileSync(sourcePath, "utf8")
        .replaceAll(".salt-theme-next", ".commercial");

      writeGeneratedFile(
        destinationPath,
        removeDeclarations(source, exportedVariableNames),
      );
    }
  }
}

function generateColorFoundation(colorTokens) {
  const sourcePath = path.join(nextThemePath, "foundations/color.css");
  const destinationPath = path.join(
    commercialThemePath,
    "foundations/color.css",
  );
  const colors = new Map(
    colorTokens.map((token) => [colorVariableName(token.path), token]),
  );
  const source = fs
    .readFileSync(sourcePath, "utf8")
    .replaceAll(".salt-theme-next", ".commercial");
  const sourceProperties = new Set(
    [...source.matchAll(/^\s+(--[\w-]+):/gm)].map((match) => match[1]),
  );
  const emittedColors = new Set();
  const lines = source.split("\n").map((line) => {
    const match = line.match(/^(\s+)(--[\w-]+):/);

    if (!match) {
      return line;
    }

    const [, indentation, property] = match;
    const rgbBaseProperty = property.endsWith("-rgb")
      ? property.slice(0, -4)
      : undefined;
    const rgbToken = rgbBaseProperty && colors.get(rgbBaseProperty);

    if (rgbToken?.$value.alpha === 1) {
      return `${indentation}${property}: ${colorChannels(rgbToken.$value).join(", ")};`;
    }

    const token = colors.get(property);

    if (!token) {
      return line;
    }

    emittedColors.add(property);

    if (token.$value.alpha === 1 && sourceProperties.has(`${property}-rgb`)) {
      return `${indentation}${property}: rgb(var(${property}-rgb));`;
    }

    return `${indentation}${property}: ${colorValue(token.$value)};`;
  });
  const closingBraceIndex = lines.findLastIndex((line) => line.trim() === "}");
  const newColors = [...colors]
    .filter(([property]) => !emittedColors.has(property))
    .map(([property, token]) => `  ${property}: ${colorValue(token.$value)};`);

  lines.splice(closingBraceIndex, 0, ...newColors);
  writeGeneratedFile(destinationPath, lines.join("\n"));
}

function destinationFor(variableName) {
  if (variableName === "--salt-navigable-background-hover") {
    return path.join("deprecated", "characteristics.css");
  }

  if (variableName === "--salt-palette-transparent") {
    return path.join("palette", "alpha.css");
  }

  const paletteMatch = variableName.match(/^--salt-palette-([^-]+)/);

  if (paletteMatch) {
    return path.join("palette", `${paletteMatch[1]}.css`);
  }

  const characteristicMatch = variableName.match(/^--salt-([^-]+)/);

  if (characteristicMatch) {
    return path.join("characteristics", `${characteristicMatch[1]}.css`);
  }

  throw new Error(`Cannot place exported variable "${variableName}"`);
}

function renderRule(selector, values) {
  if (values.length === 0) {
    return "";
  }

  const properties = values
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${properties}\n}`;
}

function addDeclarations(light, dark) {
  const declarationsByFile = new Map();

  for (const [variableName, lightToken] of light) {
    const darkToken = dark.get(variableName);

    if (!darkToken) {
      throw new Error(`Dark export is missing "${variableName}"`);
    }

    const destination = destinationFor(variableName);
    const groups = declarationsByFile.get(destination) ?? {
      common: [],
      light: [],
      dark: [],
    };

    if (lightToken.value === darkToken.value) {
      groups.common.push([variableName, lightToken.value]);
    } else {
      groups.light.push([variableName, lightToken.value]);
      groups.dark.push([variableName, darkToken.value]);
    }

    declarationsByFile.set(destination, groups);
  }

  for (const [relativePath, groups] of declarationsByFile) {
    const destinationPath = path.join(commercialThemePath, relativePath);

    if (!fs.existsSync(destinationPath)) {
      throw new Error(`No commercial theme file exists for "${relativePath}"`);
    }

    const generatedRules = [
      renderRule(".salt-theme.commercial", groups.common),
      renderRule('.salt-theme.commercial[data-mode="light"]', groups.light),
      renderRule('.salt-theme.commercial[data-mode="dark"]', groups.dark),
    ].filter(Boolean);

    fs.appendFileSync(destinationPath, `\n${generatedRules.join("\n\n")}\n`);
  }
}

function generateThemeEntry() {
  const imports = [
    "/* Foundations (base values) */",
    "@import url(foundations/index.css);",
    "",
    "@import url(commercial/foundations/alpha.css);",
    "@import url(commercial/foundations/color.css);",
    "",
    "/* Intermediate palette (refined colors) */",
    "@import url(commercial/palette/accent.css);",
    "@import url(commercial/palette/alpha.css);",
    "@import url(commercial/palette/background.css);",
    "@import url(commercial/palette/categorical.css);",
    "@import url(commercial/palette/corner.css);",
    "@import url(commercial/palette/foreground.css);",
    "@import url(commercial/palette/info.css);",
    "@import url(commercial/palette/negative.css);",
    "@import url(commercial/palette/neutral.css);",
    "@import url(commercial/palette/positive.css);",
    "@import url(commercial/palette/shadow.css);",
    "@import url(commercial/palette/warning.css);",
    "",
    "/* Characteristics (semantic values referencing the palette above) */",
    "@import url(commercial/characteristics/actionable.css);",
    "@import url(commercial/characteristics/category.css);",
    "@import url(commercial/characteristics/container.css);",
    "@import url(commercial/characteristics/content.css);",
    "@import url(commercial/characteristics/editable.css);",
    "@import url(commercial/characteristics/focused.css);",
    "@import url(commercial/characteristics/layout.css);",
    "@import url(commercial/characteristics/navigable.css);",
    "@import url(commercial/characteristics/overlayable.css);",
    "@import url(commercial/characteristics/selectable.css);",
    "@import url(commercial/characteristics/sentiment.css);",
    "@import url(commercial/characteristics/separable.css);",
    "@import url(commercial/characteristics/status.css);",
    "@import url(commercial/characteristics/target.css);",
    "@import url(commercial/characteristics/text.css);",
    "",
    "/* Deprecated */",
    "@import url(commercial/deprecated/characteristics.css);",
    "",
  ];

  fs.writeFileSync(outputPath, imports.join("\n"));
}

const lightTokens = readTokens(lightTokensPath);
const darkTokens = readTokens(darkTokensPath);
const colorTokens = readTokens(colorTokensPath);
const light = declarations(lightTokens);
const dark = declarations(darkTokens);
const characteristicValues = readNextCharacteristicValues();

if (
  light.size !== dark.size ||
  [...light.keys()].some((variableName) => !dark.has(variableName))
) {
  throw new Error("Light and dark exports do not define the same variables");
}

const { paletteDark, paletteLight, semanticDark, semanticLight } =
  createThemeLayers(light, dark, characteristicValues);
const generatedVariableNames = new Set([
  ...semanticLight.keys(),
  ...paletteLight.keys(),
]);

fs.rmSync(commercialThemePath, { force: true, recursive: true });
copyNextThemeFiles(generatedVariableNames);
generateColorFoundation(colorTokens);
writeGeneratedFile(
  path.join(commercialThemePath, "deprecated/characteristics.css"),
  "",
);
addDeclarations(paletteLight, paletteDark);
addDeclarations(semanticLight, semanticDark);
formatCommercialTheme();
generateThemeEntry();

console.log(
  `Generated ${outputPath}, ${colorTokens.length} colors, ${paletteLight.size} palette tokens, and ${semanticLight.size} theme tokens per mode`,
);
