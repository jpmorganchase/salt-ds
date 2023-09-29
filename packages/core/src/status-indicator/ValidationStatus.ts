export const VALIDATION_NAMED_STATUS = [
  "error",
  "warning",
  "success",
  "info",
] as const;

export type ValidationStatus = (typeof VALIDATION_NAMED_STATUS)[number];
