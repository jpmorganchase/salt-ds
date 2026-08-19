import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import valueParser from "postcss-value-parser";
import stylelint from "stylelint";

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

const themeEntries = {
  "theme-next.css": new Set(["deprecated", "foundations", "next"]),
  "theme.css": new Set(["deprecated", "foundations", "legacy"]),
};

const ruleName = "salt/theme-self-containment";

const messages = ruleMessages(ruleName, {
  disallowedDependency: (entry, dependency) =>
    `${entry} may not depend on ${dependency}.`,
  missingCustomProperty: (entry, property, referencingFiles) =>
    `${entry} references ${property} in ${referencingFiles}, but does not define it in its dependency graph.`,
  unreadableDependency: (entry, dependency) =>
    `${entry} cannot read dependency ${dependency}.`,
});

const meta = {
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--docs",
};

const normalizePath = (filePath) => filePath.split(path.sep).join("/");

function importPath(params) {
  const firstNode = valueParser(params).nodes.find(
    ({ type }) => type !== "comment" && type !== "space",
  );

  if (firstNode?.type === "string" || firstNode?.type === "word") {
    return firstNode.value;
  }

  if (
    firstNode?.type !== "function" ||
    firstNode.value.toLowerCase() !== "url"
  ) {
    return undefined;
  }

  const urlNodes = firstNode.nodes.filter(
    ({ type }) => type !== "comment" && type !== "space",
  );

  if (urlNodes.length === 1 && urlNodes[0].type === "string") {
    return urlNodes[0].value;
  }

  return valueParser.stringify(urlNodes).trim();
}

function analyzeTheme(entryPath, entryRoot, allowedDirectories) {
  const entryName = path.basename(entryPath);
  const themeRoot = path.dirname(entryPath);
  const definitions = new Set();
  const dependencyIssues = new Set();
  const references = new Map();
  const unreadableDependencies = new Set();
  const visited = new Set();

  function displayPath(filePath) {
    return normalizePath(path.relative(themeRoot, filePath));
  }

  function visit(filePath) {
    const resolvedPath = path.resolve(filePath);

    if (visited.has(resolvedPath)) {
      return;
    }

    visited.add(resolvedPath);

    if (resolvedPath !== entryPath) {
      const relativePath = path.relative(themeRoot, resolvedPath);
      const topLevelDirectory = relativePath.split(path.sep)[0];
      const isInsideThemeRoot =
        relativePath !== "" &&
        !relativePath.startsWith(`..${path.sep}`) &&
        relativePath !== ".." &&
        !path.isAbsolute(relativePath);

      if (!isInsideThemeRoot || !allowedDirectories.has(topLevelDirectory)) {
        dependencyIssues.add(displayPath(resolvedPath));
      }
    }

    let dependencyRoot = entryRoot;

    if (resolvedPath !== entryPath) {
      try {
        dependencyRoot = postcss.parse(fs.readFileSync(resolvedPath, "utf8"), {
          from: resolvedPath,
        });
      } catch {
        unreadableDependencies.add(displayPath(resolvedPath));
        return;
      }
    }

    dependencyRoot.walkAtRules(/^import$/i, (atRule) => {
      const importedPath = importPath(atRule.params);

      if (!importedPath) {
        return;
      }

      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(importedPath)) {
        dependencyIssues.add(importedPath);
        return;
      }

      visit(path.resolve(path.dirname(resolvedPath), importedPath));
    });

    dependencyRoot.walkDecls(({ prop, value }) => {
      if (prop.startsWith("--")) {
        definitions.add(prop);
      }

      valueParser(value).walk((node) => {
        if (node.type !== "function" || node.value.toLowerCase() !== "var") {
          return;
        }

        const propertyNode = node.nodes.find(
          ({ type }) => type !== "comment" && type !== "space",
        );

        if (
          propertyNode?.type !== "word" ||
          !propertyNode.value.startsWith("--")
        ) {
          return;
        }

        const property = propertyNode.value;
        const referencingFiles = references.get(property) ?? new Set();
        referencingFiles.add(displayPath(resolvedPath));
        references.set(property, referencingFiles);
      });
    });
  }

  visit(entryPath);

  const missingCustomProperties = [...references.entries()]
    .filter(([property]) => !definitions.has(property))
    .map(([property, referencingFiles]) => ({
      property,
      referencingFiles: [...referencingFiles].sort().join(", "),
    }))
    .sort((first, second) => first.property.localeCompare(second.property));

  return {
    dependencyIssues: [...dependencyIssues].sort(),
    entryName,
    missingCustomProperties,
    unreadableDependencies: [...unreadableDependencies].sort(),
  };
}

const ruleFunction = (primaryOption, secondaryOptionObject) => {
  return (root, result) => {
    if (!primaryOption) {
      return;
    }

    const sourcePath = root.source?.input.file ?? result.opts.from;
    const allowedDirectories = themeEntries[path.basename(sourcePath ?? "")];

    if (!sourcePath || !allowedDirectories) {
      return;
    }

    const {
      dependencyIssues,
      entryName,
      missingCustomProperties,
      unreadableDependencies,
    } = analyzeTheme(path.resolve(sourcePath), root, allowedDirectories);
    const node = root.first ?? root;
    const severity = secondaryOptionObject?.severity ?? "error";

    for (const dependency of dependencyIssues) {
      report({
        message: messages.disallowedDependency(entryName, dependency),
        node,
        result,
        ruleName,
        severity,
      });
    }

    for (const dependency of unreadableDependencies) {
      report({
        message: messages.unreadableDependency(entryName, dependency),
        node,
        result,
        ruleName,
        severity,
      });
    }

    for (const { property, referencingFiles } of missingCustomProperties) {
      report({
        message: messages.missingCustomProperty(
          entryName,
          property,
          referencingFiles,
        ),
        node,
        result,
        ruleName,
        severity,
      });
    }
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
