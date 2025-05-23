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

  // Import the CSS code
  let cssCode = "";

  try {
    // Import specific example CSS
    const exampleCssCode = (
      (await import(
        `../../examples/${componentName}/${exampleName}.module.css?raw`
      )) as Record<string, string>
    ).default;

    cssCode += exampleCssCode;
  } catch (e) {
    console.warn(`No CSS file found for example ${exampleName}`, e);
  }

  try {
    // Import general component CSS
    const componentCssCode = (
      (await import(
        `../../examples/${componentName}/index.module.css?raw`
      )) as Record<string, string>
    ).default;

    cssCode += `\n${componentCssCode}`;
  } catch (e) {
    console.warn(`No general CSS file found for component ${componentName}`, e);
  }

  return { Example, sourceCode, cssCode };
}
