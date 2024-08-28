/**
 * Support data-* attributes for pass through props, e.g. `Input.inputProps`.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-%2A
 */
export type DataAttributes = {
  [dataAttribute: `data-${string}`]: string;
};
