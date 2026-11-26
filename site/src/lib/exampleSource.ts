import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createHighlighter, type Highlighter } from "shiki";

export type ExampleSourceParams = {
  componentName: string;
  exampleName: string;
};

const namePattern = /^[\w-]+$/;
const themes = { light: "github-light", dark: "github-dark" } as const;

let highlighter: Promise<Highlighter> | undefined;

/** Next runs the site from its workspace folder. */
export function defaultExamplesDir() {
  return path.join(process.cwd(), "src/examples");
}

/** Every top-level `.tsx` file in an example folder, which includes each `LivePreview` example. */
export async function listExampleSources(
  examplesDir = defaultExamplesDir(),
): Promise<ExampleSourceParams[]> {
  const folders = await readdir(examplesDir, { withFileTypes: true });
  const params = await Promise.all(
    folders
      .filter((folder) => folder.isDirectory())
      .map(async ({ name: componentName }) => {
        const files = await readdir(path.join(examplesDir, componentName));
        return files.flatMap((file) => {
          const exampleName = file.endsWith(".tsx") ? file.slice(0, -4) : "";
          return namePattern.test(exampleName)
            ? [{ componentName, exampleName }]
            : [];
        });
      }),
  );
  return params.flat();
}

/** Returns `undefined` for names that could escape the examples folder or don't exist. */
export async function readExampleSource(
  { componentName, exampleName }: ExampleSourceParams,
  examplesDir = defaultExamplesDir(),
) {
  if (!namePattern.test(componentName) || !namePattern.test(exampleName)) {
    return undefined;
  }
  try {
    return await readFile(
      path.join(examplesDir, componentName, `${exampleName}.tsx`),
      "utf8",
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

/** Matches the client `Pre` highlighting, so either can render the result. */
export async function highlightExampleSource(source: string) {
  highlighter ??= createHighlighter({
    langs: ["tsx"],
    themes: Object.values(themes),
  });
  return (await highlighter).codeToHtml(source.trimEnd(), {
    lang: "tsx",
    themes,
    defaultColor: false,
  });
}
