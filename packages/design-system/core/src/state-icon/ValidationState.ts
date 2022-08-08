export const VALIDATION_NAMED_STATES = [
  "error",
  "success",
  "warning",
  "info",
] as const;

export type ValidationState = typeof VALIDATION_NAMED_STATES[number];
