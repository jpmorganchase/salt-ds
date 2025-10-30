export interface ValidationStatuses {
  error: string;
  warning: string;
  success: string;
  info: string;
}
export type ValidationStatus = keyof ValidationStatuses;
export const ValidationStatusValues: ValidationStatus[] = [
  "error",
  "warning",
  "success",
  "info",
];

/**
 * @deprecated use ValidationStatusValues
 */
export const VALIDATION_NAMED_STATUS = ValidationStatusValues;
