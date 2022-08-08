import { escapeRegExp } from "../../utils";

export type GetFilterRegex = (inputValue: string) => RegExp;

export type FilterPredicate = (item: string) => boolean;

const leftTrim = (value: string) =>
  value ? value.replace(/^\s+/g, "") : value;

export const getDefaultFilterRegex: GetFilterRegex = (value) =>
  new RegExp(`(${escapeRegExp(leftTrim(value))})`, "gi");

export const getDefaultFilter =
  (inputValue = "", getFilterRegex: GetFilterRegex = getDefaultFilterRegex) =>
  (itemValue = ""): boolean =>
    Boolean(itemValue.length) &&
    Boolean(inputValue.length) &&
    itemValue.match(getFilterRegex(inputValue)) !== null;
