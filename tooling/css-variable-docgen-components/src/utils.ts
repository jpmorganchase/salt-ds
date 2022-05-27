import { Component } from "@storybook/addon-docs";
import {
  UITK_CHARACTERISTICS
} from "@jpmorganchase/theme-editor/src/utils/uitkValues";

export function hasDocgen(component: Component): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !!component.__docgenInfo;
}

export function getDocgenSection<T>(component: Component, section: string): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return hasDocgen(component) ? component.__docgenInfo[section] : null;
}