export const VALIDATION_NAMED_STATUS = [
  "error",
  "success",
  "warning",
  "info",
] as const;

export type ValidationStatus = typeof VALIDATION_NAMED_STATUS[number];
