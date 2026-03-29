import { warnOnce } from "../utils/deprecate";

warnOnce({
  key: "@salt-ds/lab/date-picker",
  message:
    "@salt-ds/lab 'date-picker' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.",
});

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
export {
  DatePicker,
  DatePickerActions,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerOverlayProvider,
  DatePickerRangeGridPanel,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  DatePickerTrigger,
  DateRangeSelectionContext,
  SingleDateSelectionContext,
  useDatePickerContext,
  useDatePickerOverlay,
} from "@salt-ds/date-components";
