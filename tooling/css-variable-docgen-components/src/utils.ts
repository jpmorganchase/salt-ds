import type { useOf } from "@storybook/addon-docs";
import { getDocgenSection, isValidDocgenSection } from "@storybook/docs-tools";

const SALT_CHARACTERISTICS = [
  "accent",
  "actionable",
  "container",
  "delay",
  "draggable",
  "target",
  "editable",
  "focused",
  "navigable",
  "overlayable",
  "selectable",
  "separable",
  "status",
  "taggable",
  "text",
  "track",
];

export interface ClassName {
  name: string;
  description: string;
}

interface CSSVariable {
  name: string;
  type?: string;
  defaultValue?: string;
}

export function getCharacteristics(resolved: ReturnType<typeof useOf>) {
  const section = getDocgenSection(resolved, "cssVariablesApi") as Record<
    string,
    CSSVariable[]
  >;
  if (isValidDocgenSection(section)) {
    const characteristicFoundationTokenMap: Record<string, string[]> = {};

    Object.keys(section).forEach((token) => {
      if (token.startsWith("--salt-")) {
        const characteristicName = token.replace("--salt-", "").split("-")[0];
        if (
          characteristicName.length &&
          SALT_CHARACTERISTICS.includes(characteristicName)
        ) {
          if (!characteristicFoundationTokenMap[characteristicName]) {
            characteristicFoundationTokenMap[characteristicName] = [token];
          } else if (
            !characteristicFoundationTokenMap[characteristicName]?.includes(
              token,
            )
          ) {
            characteristicFoundationTokenMap[characteristicName].push(token);
          }
        }
      }
    });

    return characteristicFoundationTokenMap;
  }

  return {};
}

export function getClassNames(
  resolved: ReturnType<typeof useOf>,
): Record<string, ClassName> {
  const classNames = getDocgenSection(resolved, "classNames") as Record<
    string,
    ClassName
  >;

  if (isValidDocgenSection(classNames)) {
    return classNames;
  }

  return {};
}
