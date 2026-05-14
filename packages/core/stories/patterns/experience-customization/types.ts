import type { ChangeEvent } from "react";
import type { FieldValidation } from "../wizard/useWizardForm";

export interface ECFormData {
  acceptTerms: boolean;
  language: string;
  region: string;
  publicHolidayCalendar: string;
  position: string;
  displayDensity: string;
  stockNameDisplay: string;
  exchangeAndRegionDisplay: string;
  visibleMetrics: string;
  performanceChart: boolean;
  autoDismiss: boolean;
  extendDisplayTime: boolean;
  firstDayOfWeek: string;
  timeFormat: string;
  measurementSystem: string;
}

export interface FormContentProps {
  formData: ECFormData;
  handleInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  stepFieldValidation: Record<string, FieldValidation>;
  handleSelectChange?: (value: string, name: string) => void;
  handleRadioChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
