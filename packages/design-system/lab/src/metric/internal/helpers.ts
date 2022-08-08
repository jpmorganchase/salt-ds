/**
 * This function only capitalise the first letter of a string.
 */
export const capitalise = (target: any) =>
  typeof target === "string"
    ? target.charAt(0).toUpperCase() + target.slice(1)
    : "";
