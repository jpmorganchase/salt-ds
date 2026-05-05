import {
  DatePicker as _DatePicker,
  DatePickerActions as _DatePickerActions,
  DatePickerHelperText as _DatePickerHelperText,
  DatePickerOverlay as _DatePickerOverlay,
  DatePickerOverlayProvider as _DatePickerOverlayProvider,
  DatePickerRangeGridPanel as _DatePickerRangeGridPanel,
  DatePickerRangeInput as _DatePickerRangeInput,
  DatePickerRangePanel as _DatePickerRangePanel,
  DatePickerSingleGridPanel as _DatePickerSingleGridPanel,
  DatePickerSingleInput as _DatePickerSingleInput,
  DatePickerTrigger as _DatePickerTrigger,
  useDatePickerContext as _useDatePickerContext,
  useDatePickerOverlay as _useDatePickerOverlay,
} from "@salt-ds/date-components";
import {
  deprecatedComponent,
  deprecatedFunction,
} from "../utils/deprecatedExport";

const KEY = "@salt-ds/lab/date-picker";
const MSG =
  "@salt-ds/lab 'date-picker' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.";

// Components
export const DatePicker = deprecatedComponent(
  _DatePicker,
  "DatePicker",
  KEY,
  MSG,
);
export const DatePickerActions = deprecatedComponent(
  _DatePickerActions,
  "DatePickerActions",
  KEY,
  MSG,
);
export const DatePickerHelperText = deprecatedComponent(
  _DatePickerHelperText,
  "DatePickerHelperText",
  KEY,
  MSG,
);
export const DatePickerOverlay = deprecatedComponent(
  _DatePickerOverlay,
  "DatePickerOverlay",
  KEY,
  MSG,
);
export const DatePickerOverlayProvider = deprecatedComponent(
  _DatePickerOverlayProvider,
  "DatePickerOverlayProvider",
  KEY,
  MSG,
);
export const DatePickerRangeGridPanel = deprecatedComponent(
  _DatePickerRangeGridPanel,
  "DatePickerRangeGridPanel",
  KEY,
  MSG,
);
export const DatePickerRangeInput = deprecatedComponent(
  _DatePickerRangeInput,
  "DatePickerRangeInput",
  KEY,
  MSG,
);
export const DatePickerRangePanel = deprecatedComponent(
  _DatePickerRangePanel,
  "DatePickerRangePanel",
  KEY,
  MSG,
);
export const DatePickerSingleGridPanel = deprecatedComponent(
  _DatePickerSingleGridPanel,
  "DatePickerSingleGridPanel",
  KEY,
  MSG,
);
export const DatePickerSingleInput = deprecatedComponent(
  _DatePickerSingleInput,
  "DatePickerSingleInput",
  KEY,
  MSG,
);
export const DatePickerTrigger = deprecatedComponent(
  _DatePickerTrigger,
  "DatePickerTrigger",
  KEY,
  MSG,
);

// Hooks
export const useDatePickerContext = deprecatedFunction(
  _useDatePickerContext,
  KEY,
  MSG,
);
export const useDatePickerOverlay = deprecatedFunction(
  _useDatePickerOverlay,
  KEY,
  MSG,
);

// Types — no side effects
export type {
  DatePickerActionsProps,
  DatePickerOpenChangeReason,
  DatePickerProps,
  DatePickerRangeGridPanelProps,
  DatePickerSingleGridPanelProps,
  DatePickerState,
  RangeDatePickerState,
  SingleDatePickerState,
  UseDatePickerContextProps,
} from "@salt-ds/date-components";
// Context objects — re-export directly (no runtime cost)
export {
  DateRangeSelectionContext,
  SingleDateSelectionContext,
} from "@salt-ds/date-components";
