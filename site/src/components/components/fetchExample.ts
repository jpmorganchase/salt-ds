import type { ElementType } from "react";

export default async function fetchExample(
  componentName: string,
  exampleName: string,
) {
  const Example = (
    (await import(`../../examples/${componentName}`)) as Record<
      string,
      ElementType
    >
  )[exampleName];
  const sourceCode = (
    (await import(
      `../../examples/${componentName}/${exampleName}.tsx?raw`
    )) as Record<string, string>
  ).default;

  return { Example, sourceCode };
}
