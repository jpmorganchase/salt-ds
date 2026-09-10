import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsPath = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(scriptsPath, "../src/css");
const nextPath = path.join(cssPath, "next");
const commercialPath = path.join(cssPath, "commercial");
const generatedComment =
  "/* Generated from the commercial Figma token exports. */";
const declarationPattern = /(--salt-[\w-]+):\s*([^;]+);/g;

function declarations(css) {
  return [...css.matchAll(declarationPattern)].map(([, name, value]) => [
    name,
    value.trim(),
  ]);
}

function declarationNames(css) {
  return [...new Set(declarations(css).map(([name]) => name))];
}

function modeFor(selector) {
  if (selector.includes('[data-mode="light"]')) {
    return "light";
  }

  if (selector.includes('[data-mode="dark"]')) {
    return "dark";
  }

  return "common";
}

function valuesByMode(css) {
  const values = {
    common: new Map(),
    light: new Map(),
    dark: new Map(),
  };

  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/gs)) {
    if (
      selector.includes("[data-accent") &&
      !selector.includes('[data-accent="teal"]')
    ) {
      continue;
    }

    if (
      selector.includes("[data-corner") &&
      !selector.includes('[data-corner="rounded"]')
    ) {
      continue;
    }

    if (
      selector.includes("[data-") &&
      !selector.includes("[data-mode") &&
      !selector.includes("[data-accent") &&
      !selector.includes("[data-corner")
    ) {
      throw new Error(
        `Unsupported selector while grouping: "${selector.trim()}"`,
      );
    }

    const modeValues = values[modeFor(selector)];

    for (const declaration of declarations(body)) {
      const [name, value] = declaration;
      const existing = modeValues.get(name);

      if (existing && existing !== value) {
        throw new Error(
          `"${name}" has conflicting values "${existing}" and "${value}"`,
        );
      }

      modeValues.set(name, value);
    }
  }

  return {
    common: values.common,
    light: new Map([...values.common, ...values.light]),
    dark: new Map([...values.common, ...values.dark]),
  };
}

function assertMapsEqual(expected, actual, context) {
  const names = new Set([...expected.keys(), ...actual.keys()]);

  for (const name of names) {
    if (expected.get(name) !== actual.get(name)) {
      throw new Error(
        `${context}: "${name}" changed from "${expected.get(name)}" to "${actual.get(name)}"`,
      );
    }
  }
}

function insertAfter(names, name, anchor) {
  if (!names.includes(name)) {
    const index = names.indexOf(anchor);

    if (index === -1) {
      throw new Error(`Cannot insert "${name}" after missing "${anchor}"`);
    }

    names.splice(index + 1, 0, name);
  }
}

const coreColorFamilies = [
  "gray",
  "blue",
  "brown",
  "green",
  "teal",
  "orange",
  "red",
  "purple",
  "background",
  "logo",
];
const baseColorFamilies = [
  "snow",
  "wheat",
  "jet",
  "jpm-brown",
  "black",
  "white",
];
const commercialColorFamilies = ["accent", "brand", "dove-gray", "pigeon-gray"];

function colorFamily(variableName) {
  const name = variableName.slice("--salt-color-".length).replace(/-rgb$/, "");

  if (name.startsWith("background-")) {
    return "background";
  }

  if (name.startsWith("logo-")) {
    return "logo";
  }

  if (name.includes("-dark-alpha-")) {
    return "interaction";
  }

  const segments = name.split("-");
  const shadeIndex = segments.findIndex((segment) =>
    /^\d+(?:a)?$/.test(segment),
  );

  return shadeIndex === -1 ? name : segments.slice(0, shadeIndex).join("-");
}

function colorSortKey(variableName) {
  const name = variableName.slice("--salt-color-".length).replace(/-rgb$/, "");
  const numbers = [...name.matchAll(/(?:^|-)(\d+)(?:a)?(?=-|$)/g)].map(
    (match) => Number(match[1]),
  );

  return [numbers[0] ?? -1, numbers[1] ?? -1, name];
}

function compareColors(left, right) {
  const leftKey = colorSortKey(left);
  const rightKey = colorSortKey(right);

  return (
    leftKey[0] - rightKey[0] ||
    leftKey[1] - rightKey[1] ||
    leftKey[2].localeCompare(rightKey[2])
  );
}

function categoricalColorFamilies() {
  const css = fs.readFileSync(
    path.join(commercialPath, "palette/categorical.css"),
    "utf8",
  );
  const families = [];

  for (const [, colorName] of css.matchAll(/var\((--salt-color-([\w-]+))\)/g)) {
    const family = colorFamily(colorName);

    if (!families.includes(family)) {
      families.push(family);
    }
  }

  return families;
}

function declarationsByFamily(names) {
  const result = new Map();

  for (const name of names) {
    const family = colorFamily(name);
    const familyNames = result.get(family) ?? [];
    familyNames.push(name);
    result.set(family, familyNames);
  }

  for (const familyNames of result.values()) {
    familyNames.sort(compareColors);
  }

  return result;
}

function renderColorSection(title, families, namesByFamily, values) {
  const groups = [];

  for (const family of families) {
    const names = namesByFamily.get(family);

    if (!names) {
      continue;
    }

    groups.push(
      names.map((name) => `  ${name}: ${values.get(name)};`).join("\n"),
    );
    namesByFamily.delete(family);
  }

  return groups.length === 0
    ? undefined
    : `  /* ${title} */\n${groups.join("\n\n")}`;
}

function regroupColorFoundations() {
  const colorPath = path.join(commercialPath, "foundations/color.css");
  const alphaPath = path.join(commercialPath, "foundations/alpha.css");
  const colorCss = fs.readFileSync(colorPath, "utf8");
  const alphaCss = fs.readFileSync(alphaPath, "utf8");
  const sourceValues = new Map([
    ...declarations(alphaCss),
    ...declarations(colorCss),
  ]);
  const values = new Map();
  const alphaNames = [];
  const solidNames = [];

  for (const [name, value] of sourceValues) {
    if (value.startsWith("rgba(")) {
      const variableMatch = value.match(
        /^rgba\(var\((--salt-color-[\w-]+-rgb)\),\s*([\d.]+)\)$/,
      );
      const literalMatch = value.match(
        /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/,
      );
      const baseName = name.replace(/-\d+a$/, "");
      const baseValue = sourceValues.get(baseName);

      if (variableMatch) {
        const [, rgbName, alpha] = variableMatch;

        if (rgbName !== `${baseName}-rgb`) {
          throw new Error(
            `Alpha color "${name}" references "${rgbName}" instead of "${baseName}-rgb"`,
          );
        }

        values.set(name, `rgba(var(${rgbName}), ${alpha})`);
        alphaNames.push(name);
        continue;
      }

      if (!literalMatch || !baseValue) {
        throw new Error(`Cannot normalize alpha color "${name}: ${value}"`);
      }

      const alpha = literalMatch[4];
      values.set(name, `rgba(var(${baseName}-rgb), ${alpha})`);
      alphaNames.push(name);
      continue;
    }

    if (name.endsWith("-rgb")) {
      values.set(name, value);
      solidNames.push(name);
      continue;
    }

    const literalRgb = value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);

    if (literalRgb) {
      const rgbName = `${name}-rgb`;

      values.set(rgbName, literalRgb.slice(1).join(", "));
      values.set(name, `rgb(var(${rgbName}))`);
      solidNames.push(rgbName, name);
      continue;
    }

    values.set(name, value);
    solidNames.push(name);
  }

  const rgbNames = solidNames.filter((name) => name.endsWith("-rgb"));
  const colorNames = solidNames.filter((name) => !name.endsWith("-rgb"));
  const rgbByFamily = declarationsByFamily(rgbNames);
  const colorsByFamily = declarationsByFamily(colorNames);
  const nextFamilies = [
    ...new Set(
      declarationNames(
        fs.readFileSync(path.join(nextPath, "foundations/color.css"), "utf8"),
      ).map(colorFamily),
    ),
  ];
  const categoricalFamilies = [
    ...categoricalColorFamilies(),
    ...nextFamilies.filter(
      (family) =>
        !coreColorFamilies.includes(family) &&
        !baseColorFamilies.includes(family) &&
        !commercialColorFamilies.includes(family),
    ),
  ].filter((family, index, families) => families.indexOf(family) === index);
  const allColorFamilies = [
    ...coreColorFamilies,
    ...baseColorFamilies,
    ...categoricalFamilies,
    ...commercialColorFamilies,
    "interaction",
  ];
  const colorSections = [
    renderColorSection("RGB channels", allColorFamilies, rgbByFamily, values),
    renderColorSection(
      "Core color palettes",
      coreColorFamilies,
      colorsByFamily,
      values,
    ),
    renderColorSection(
      "Base colors",
      baseColorFamilies,
      colorsByFamily,
      values,
    ),
    renderColorSection(
      "Categorical color palettes",
      categoricalFamilies,
      colorsByFamily,
      values,
    ),
    renderColorSection(
      "Commercial color palettes",
      commercialColorFamilies,
      colorsByFamily,
      values,
    ),
    renderColorSection(
      "Preblended interaction colors",
      ["interaction"],
      colorsByFamily,
      values,
    ),
  ].filter(Boolean);
  const remainingRgb = [...rgbByFamily.keys()].sort();
  const remainingColors = [...colorsByFamily.keys()].sort();

  if (remainingRgb.length > 0 || remainingColors.length > 0) {
    throw new Error(
      `Ungrouped foundation colors: ${[...remainingRgb, ...remainingColors].join(", ")}`,
    );
  }

  const alphaByFamily = declarationsByFamily(alphaNames);
  const alphaFamilyOrder = [
    ...coreColorFamilies,
    ...baseColorFamilies,
    ...categoricalFamilies,
    ...commercialColorFamilies,
    ...[...alphaByFamily.keys()].sort(),
  ].filter((family, index, families) => families.indexOf(family) === index);
  const alphaSection = renderColorSection(
    "Alpha colors",
    alphaFamilyOrder,
    alphaByFamily,
    values,
  );

  if (alphaByFamily.size > 0) {
    throw new Error(
      `Ungrouped alpha colors: ${[...alphaByFamily.keys()].join(", ")}`,
    );
  }

  fs.writeFileSync(
    colorPath,
    `${generatedComment}\n.salt-theme.commercial {\n${colorSections.join("\n\n")}\n}\n`,
  );
  fs.writeFileSync(
    alphaPath,
    `${generatedComment}\n.salt-theme.commercial {\n${alphaSection}\n}\n`,
  );
}

const textExtraAnchors = new Map([
  ["--salt-text-code-fontWeight", "--salt-text-code-fontFamily"],
  ["--salt-text-heading-fontFamily", "--salt-text-action-fontWeight-strong"],
  ["--salt-text-heading-fontWeight", "--salt-text-heading-fontFamily"],
  ["--salt-text-heading-fontWeight-small", "--salt-text-heading-fontWeight"],
  [
    "--salt-text-heading-fontWeight-strong",
    "--salt-text-heading-fontWeight-small",
  ],
  ["--salt-text-display-fontFamily", "--salt-text-h4-fontWeight-strong"],
  ["--salt-text-display-fontWeight", "--salt-text-display-fontFamily"],
  ["--salt-text-display-fontWeight-small", "--salt-text-display-fontWeight"],
  [
    "--salt-text-display-fontWeight-strong",
    "--salt-text-display-fontWeight-small",
  ],
]);

function textGroup(name) {
  if (
    [
      "--salt-text-letterSpacing",
      "--salt-text-textAlign",
      "--salt-text-textAlign-embedded",
    ].includes(name)
  ) {
    return "Misc";
  }

  const segment = name.slice("--salt-text-".length).split("-")[0];
  const groups = new Map([
    ["fontFamily", "Body text (should be used as default)"],
    ["fontWeight", "Body text (should be used as default)"],
    ["notation", "Notation"],
    ["label", "Label"],
    ["code", "Code"],
    ["action", "Action"],
    ["heading", "Heading"],
    ["h1", "H1"],
    ["h2", "H2"],
    ["h3", "H3"],
    ["h4", "H4"],
    ["display", "Display text"],
    ["display1", "Display 1"],
    ["display2", "Display 2"],
    ["display3", "Display 3"],
    ["display4", "Display 4"],
  ]);

  return groups.get(segment);
}

function regroupText() {
  const fileName = "text.css";
  const filePath = path.join(commercialPath, "characteristics", fileName);
  const current = fs.readFileSync(filePath, "utf8");
  const values = new Map();

  for (const [, selector, body] of current.matchAll(/([^{}]+)\{([^{}]*)\}/gs)) {
    if (
      selector.includes(".salt-theme.commercial") &&
      !selector.includes(".salt-density") &&
      !selector.includes("[data-")
    ) {
      for (const [name, value] of declarations(body)) {
        const existing = values.get(name);

        if (existing && existing !== value) {
          throw new Error(
            `text.css defines "${name}" as both "${existing}" and "${value}"`,
          );
        }

        values.set(name, value);
      }
    }
  }

  if (values.size === 0) {
    throw new Error("text.css is missing its commercial theme declarations");
  }
  const names = declarationNames(
    fs.readFileSync(path.join(nextPath, "characteristics", fileName), "utf8"),
  ).filter((name) => values.has(name));

  for (const [name, anchor] of textExtraAnchors) {
    if (values.has(name)) {
      insertAfter(names, name, anchor);
    }
  }

  const unsupportedExtras = [...values.keys()].filter(
    (name) => !names.includes(name),
  );

  if (unsupportedExtras.length > 0) {
    throw new Error(
      `${fileName} has unsupported extra declarations: ${unsupportedExtras.join(", ")}`,
    );
  }

  const lines = [];
  let previousGroup;

  for (const name of names) {
    const group = textGroup(name);

    if (!group) {
      throw new Error(`No text group exists for "${name}"`);
    }

    if (group !== previousGroup) {
      if (lines.length > 0) {
        lines.push("");
      }

      lines.push(`  /* ${group} */`);
      previousGroup = group;
    }

    lines.push(`  ${name}: ${values.get(name)};`);
  }

  const densityRules = [...current.matchAll(/([^{}]+)\{([^{}]*)\}/gs)]
    .filter(([, selector]) => selector.includes(".salt-density"))
    .map(([, selector, body]) => {
      const cleanSelector = selector.replaceAll(/\/\*[\s\S]*?\*\//g, "").trim();

      return `${cleanSelector} {${body}}`.trim();
    });

  if (densityRules.length === 0) {
    throw new Error("text.css is missing its density groups");
  }

  const result = `${generatedComment}\n.salt-theme.commercial {\n${lines.join("\n")}\n}\n\n/* Sizes by density */\n${densityRules.join("\n\n")}\n`;
  fs.writeFileSync(filePath, result);
}

function regroupCharacteristics() {
  const directory = path.join(commercialPath, "characteristics");

  for (const fileName of fs.readdirSync(directory)) {
    if (["layout.css", "text.css"].includes(fileName)) {
      continue;
    }

    const filePath = path.join(directory, fileName);
    const current = fs.readFileSync(filePath, "utf8");
    const currentValues = valuesByMode(current).common;
    const template = fs
      .readFileSync(path.join(nextPath, "characteristics", fileName), "utf8")
      .replaceAll(".salt-theme-next", ".commercial");
    const templateNames = new Set(declarationNames(template));
    const extras = [...currentValues.keys()].filter(
      (name) => !templateNames.has(name),
    );

    if (extras.length > 0) {
      throw new Error(
        `${fileName} has unsupported extra declarations: ${extras.join(", ")}`,
      );
    }

    const lines = template.split("\n").map((line) => {
      const match = line.match(/^(\s*)(--salt-[\w-]+):\s*([^;]+);(.*)$/);

      if (!match) {
        return line;
      }

      const [, indentation, name, , suffix] = match;
      const value = currentValues.get(name);

      if (!value) {
        throw new Error(`${fileName} is missing "${name}"`);
      }

      return `${indentation}${name}: ${value};${suffix}`;
    });
    const result = `${generatedComment}\n${lines.join("\n").trim()}\n`;

    assertMapsEqual(
      valuesByMode(current).light,
      valuesByMode(result).light,
      `${fileName} light`,
    );
    assertMapsEqual(
      valuesByMode(current).dark,
      valuesByMode(result).dark,
      `${fileName} dark`,
    );
    fs.writeFileSync(filePath, result);
  }
}

const extraPaletteAnchors = new Map([
  ["--salt-palette-accent-hover", "--salt-palette-accent-disabled"],
  ["--salt-palette-accent-selected", "--salt-palette-accent-hover"],
  [
    "--salt-palette-categorical-1-dataviz",
    "--salt-palette-categorical-1-strong",
  ],
  ["--salt-palette-negative-hover", "--salt-palette-negative"],
  ["--salt-palette-neutral-hover", "--salt-palette-neutral-readonly"],
  ["--salt-palette-positive-hover", "--salt-palette-positive"],
  ["--salt-palette-warning-hover", "--salt-palette-warning"],
]);

function declarationGroup(name, fileName) {
  if (fileName === "categorical.css") {
    return name.match(/--salt-palette-categorical-(\d+)/)?.[1];
  }

  if (fileName === "alpha.css") {
    return (
      name.match(/--salt-palette-alpha-(contrast|dark|light)(?:-|$)/)?.[1] ??
      "alpha"
    );
  }

  return undefined;
}

function renderDeclarations(names, values, fileName) {
  const lines = [];
  let previousGroup;

  for (const name of names) {
    const value = values.get(name);

    if (!value) {
      throw new Error(`${fileName} is missing a value for "${name}"`);
    }

    const group = declarationGroup(name, fileName);

    if (lines.length > 0 && group !== undefined && group !== previousGroup) {
      lines.push("");
    }

    lines.push(`  ${name}: ${value};`);
    previousGroup = group;
  }

  return lines.join("\n");
}

function renderRule(selector, names, values, fileName) {
  return `${selector} {\n${renderDeclarations(names, values, fileName)}\n}`;
}

function regroupPalettes() {
  const directory = path.join(commercialPath, "palette");

  for (const fileName of fs.readdirSync(directory)) {
    const filePath = path.join(directory, fileName);
    const current = fs.readFileSync(filePath, "utf8");
    const currentValues = valuesByMode(current);
    const template = fs.readFileSync(
      path.join(nextPath, "palette", fileName),
      "utf8",
    );
    const names = declarationNames(template);
    const currentNames = declarationNames(current);

    for (const [name, anchor] of extraPaletteAnchors) {
      if (currentNames.includes(name)) {
        insertAfter(names, name, anchor);
      }
    }

    const unsupportedExtras = currentNames.filter(
      (name) => name !== "--salt-palette-transparent" && !names.includes(name),
    );

    if (unsupportedExtras.length > 0) {
      throw new Error(
        `${fileName} has unsupported extra declarations: ${unsupportedExtras.join(", ")}`,
      );
    }

    let rules;

    if (fileName === "corner.css") {
      rules = [
        renderRule(
          ".salt-theme.commercial",
          names,
          currentValues.common,
          fileName,
        ),
      ];
    } else {
      const selectorPrefix =
        fileName === "alpha.css" ? ".commercial" : ".salt-theme.commercial";
      rules = [];

      if (
        fileName === "alpha.css" &&
        currentNames.includes("--salt-palette-transparent")
      ) {
        rules.push(
          renderRule(
            ".salt-theme.commercial",
            ["--salt-palette-transparent"],
            currentValues.common,
            fileName,
          ),
        );
      }

      rules.push(
        renderRule(
          `${selectorPrefix}[data-mode="light"]`,
          names,
          currentValues.light,
          fileName,
        ),
        renderRule(
          `${selectorPrefix}[data-mode="dark"]`,
          names,
          currentValues.dark,
          fileName,
        ),
      );
    }

    const result = `${generatedComment}\n${rules.join("\n\n")}\n`;

    assertMapsEqual(
      currentValues.light,
      valuesByMode(result).light,
      `${fileName} light`,
    );
    assertMapsEqual(
      currentValues.dark,
      valuesByMode(result).dark,
      `${fileName} dark`,
    );
    fs.writeFileSync(filePath, result);
  }
}

export function formatCommercialTheme() {
  regroupColorFoundations();
  regroupCharacteristics();
  regroupText();
  regroupPalettes();
}
