export interface ValidationStatuses {
  error: string;
  warning: string;
  success: string;
  info: string;
}

export type ValidationStatus = keyof ValidationStatuses;

const ValidationStatusValues = ["error", "warning", "success", "info"] as const;

/**
 * @deprecated use ValidationStatusValues
 */
export const VALIDATION_NAMED_STATUS = ValidationStatusValues;
