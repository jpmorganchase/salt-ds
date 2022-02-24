import { Component } from "@storybook/addon-docs";

export function hasDocgen(component: Component): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !!component.__docgenInfo;
}

export function getDocgenSection<T>(component: Component, section: string): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return hasDocgen(component) ? component.__docgenInfo[section] : null;
}
