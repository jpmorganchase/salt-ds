import { SALT_CHARACTERISTICS } from "@salt-ds/theme-editor/src/utils/saltValues";
import { Component } from "@storybook/addon-docs";

export function hasDocgen(component: Component): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !!component.__docgenInfo;
}

export function getDocgenSection<T>(component: Component, section: string): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return hasDocgen(component) ? component.__docgenInfo[section] : null;
}

export function getCharacteristics<T extends object>(
  cssVariablesApi: T
): Record<string, string[]> {
  const characteristicFoundationTokenMap: Record<string, string[]> = {};

  Object.keys(cssVariablesApi).forEach((token) => {
    if (token.startsWith("--salt-")) {
      const characteristicName = token.replace("--salt-", "").split("-")[0];
      if (
        characteristicName.length &&
        SALT_CHARACTERISTICS.includes(characteristicName)
      ) {
        if (!characteristicFoundationTokenMap[characteristicName]) {
          characteristicFoundationTokenMap[characteristicName] = [token];
        } else if (
          !characteristicFoundationTokenMap[characteristicName]?.includes(token)
        ) {
          characteristicFoundationTokenMap[characteristicName].push(token);
        }
      }
    }
  });

  return characteristicFoundationTokenMap;
}
