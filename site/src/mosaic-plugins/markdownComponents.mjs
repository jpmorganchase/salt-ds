import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = new URL("../", import.meta.url);
const repositoryExamples =
  "https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples";

function nameAttribute(attributes, name, fallback) {
  const value = attributes[name] ?? fallback;
  if (typeof value !== "string" || !/^[\w-]+$/.test(value)) {
    throw new Error(`Expected a literal ${name} for Markdown conversion`);
  }
  return value;
}

function codeBlock(source, language) {
  const backticks = source.match(/`+/g) ?? [];
  const fence = "`".repeat(
    Math.max(3, ...backticks.map((run) => run.length + 1)),
  );
  return `${fence}${language}\n${source.trimEnd()}\n${fence}`;
}

function tableCell(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, "<br />");
}

function inlineCode(value) {
  const text = String(value);
  const backticks = text.match(/`+/g) ?? [];
  const fence = "`".repeat(
    Math.max(1, ...backticks.map((run) => run.length + 1)),
  );
  const escaped = text.replaceAll("|", "\\|").replace(/\r?\n/g, " ");
  return `${fence} ${escaped} ${fence}`;
}

/** Convert the same sources used by Salt's interactive examples and API tables. */
export function createMarkdownComponents({
  examplesDir = fileURLToPath(new URL("examples/", sourceRoot)),
  propsDir = fileURLToPath(new URL("props/", sourceRoot)),
} = {}) {
  const propFiles = new Map();

  async function loadProps(packageName) {
    const filename = path.join(propsDir, `${packageName}-props.json`);
    const { mtimeMs, size } = await stat(filename);
    const previous = propFiles.get(filename);
    if (previous?.mtimeMs === mtimeMs && previous.size === size) {
      return previous.data;
    }
    const data = JSON.parse(await readFile(filename, "utf8"));
    propFiles.set(filename, { mtimeMs, size, data });
    return data;
  }

  return {
    async LivePreview({ attributes }) {
      const component = nameAttribute(attributes, "componentName");
      const example = nameAttribute(attributes, "exampleName");
      const source = await readFile(
        path.join(examplesDir, component, `${example}.tsx`),
        "utf8",
      );
      return [
        codeBlock(source, "tsx"),
        `[Example source and supporting files](${repositoryExamples}/${component})`,
      ].join("\n\n");
    },

    async PropsTable({ attributes }) {
      const packageName = nameAttribute(attributes, "packageName", "core");
      const componentName = nameAttribute(attributes, "componentName");
      const components = await loadProps(packageName);
      const component = components.find(
        ({ displayName }) => displayName === componentName,
      );
      if (!component) {
        throw new Error(
          `No generated props for ${packageName}/${componentName}; run gen:props before generating Markdown`,
        );
      }
      return [
        "| Name | Type | Required | Description | Default |",
        "| --- | --- | --- | --- | --- |",
        ...Object.values(component.props).map(
          ({ name, type, required, description, defaultValue }) =>
            `| ${inlineCode(name)} | ${inlineCode(type.name)} | ${required ? "Yes" : "No"} | ${tableCell(description)} | ${defaultValue ? inlineCode(defaultValue.value) : "—"} |`,
        ),
      ].join("\n");
    },
  };
}

export default createMarkdownComponents();
