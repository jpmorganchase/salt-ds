export interface ValidationStatuses {
  error: string;
  warning: string;
  success: string;
  info: string;
}

export type ValidationStatus = keyof ValidationStatuses;

const ValidationStatusValues = ["error", "warning", "success", "info"] as const;

/**
 * @deprecated since 1.55.0. Use `ValidationStatusValues`.
 */
export const VALIDATION_NAMED_STATUS = ValidationStatusValues;
