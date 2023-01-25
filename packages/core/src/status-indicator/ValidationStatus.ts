export const VALIDATION_NAMED_STATUS = [
  "error",
  "warning",
  "success",
  "info",
] as string[];

export type ValidationStatus = typeof VALIDATION_NAMED_STATUS[number];
