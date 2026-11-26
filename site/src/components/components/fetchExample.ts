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
  if (!Example) {
    throw new Error(`${componentName} has no example named ${exampleName}`);
  }
  return Example;
}
