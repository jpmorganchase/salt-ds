import type { ElementType } from "react";
import patternManifest from "../../examples/patterns/manifest.json";
import {
  patternExampleLoaders,
  patternSourceLoaders,
} from "./patternSourceLoaders";

const textFilePattern = /\.(?:css|js|jsx|ts|tsx)$/;

async function fetchPatternSource(componentName: string) {
  const id = componentName.slice("patterns/".length);
  const manifestEntry = patternManifest.examples.find(
    (example) => example.id === id,
  );

  if (!manifestEntry) {
    throw new Error(`Pattern example ${id} is not declared in the manifest`);
  }

  const sourceFiles = await Promise.all(
    manifestEntry.files.map(async (file) => {
      if (!textFilePattern.test(file)) {
        return `// Binary asset: ${file}`;
      }
      const loader = patternSourceLoaders[
        file as keyof typeof patternSourceLoaders
      ];
      if (!loader) throw new Error(`No source loader is declared for ${file}`);
      const source = (await loader()).default;
      return `// ${file}\n${source.trimEnd()}`;
    }),
  );

  const dependencies = [
    ...manifestEntry.saltPackages,
    ...manifestEntry.externalDependencies,
  ];
  return [
    `// Dependencies: ${dependencies.join(", ")}`,
    ...sourceFiles,
  ].join("\n\n");
}

export default async function fetchExample(
  componentName: string,
  exampleName: string,
) {
  const isPattern = componentName.startsWith("patterns/");
  const module = isPattern
    ? await patternExampleLoaders[
        componentName.slice(
          "patterns/".length,
        ) as keyof typeof patternExampleLoaders
      ]()
    : await import(
        /* webpackExclude: /patterns\// */ `../../examples/${componentName}`
      );
  const Example = (module as Record<string, ElementType>)[exampleName];
  const sourceCode = isPattern
    ? await fetchPatternSource(componentName)
    : (
        (await import(
          `../../examples/${componentName}/${exampleName}.tsx?raw`
        )) as Record<string, string>
      ).default;

  return { Example, sourceCode };
}
