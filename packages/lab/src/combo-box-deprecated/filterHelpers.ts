import { escapeRegExp } from "../utils";

/**
 * @deprecated since 1.0.0-alpha.110. Use `ComboBox` from `@salt-ds/core` instead.
 */
export type GetFilterRegex = (inputValue: string) => RegExp;

const leftTrim = (value: string) =>
  value ? value.replace(/^\s+/g, "") : value;

/**
 * @deprecated since 1.0.0-alpha.110. Use `ComboBox` from `@salt-ds/core` instead.
 */
export const getDefaultFilterRegex: GetFilterRegex = (value) =>
  new RegExp(`(${escapeRegExp(leftTrim(value))})`, "gi");

/**
 * @deprecated since 1.0.0-alpha.110. Use `ComboBox` from `@salt-ds/core` instead.
 */
export const getDefaultFilter =
  (inputValue = "", getFilterRegex: GetFilterRegex = getDefaultFilterRegex) =>
  (itemValue = ""): boolean =>
    Boolean(itemValue.length) &&
    Boolean(inputValue.length) &&
    itemValue.match(getFilterRegex(inputValue)) !== null;
