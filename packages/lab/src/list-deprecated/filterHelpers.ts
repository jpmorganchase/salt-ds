import { escapeRegExp } from "../utils";

export const getDefaultFilterRegex = (value: string) =>
  new RegExp(`(${escapeRegExp(value)})`, "gi");

export const getDefaultFilter =
  (inputValue = "", getFilterRegex = getDefaultFilterRegex) =>
  (itemValue = "") =>
    Boolean(itemValue.length) &&
    Boolean(inputValue.length) &&
    itemValue.trim().match(getFilterRegex(inputValue.trim())) !== null;
