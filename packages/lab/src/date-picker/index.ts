import { warnOnce } from "../utils/deprecate";

warnOnce({
  key: "@salt-ds/lab/date-picker",
  message:
    "@salt-ds/lab 'date-picker' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.",
});

export {
  DatePicker,
  DatePickerActions,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerOverlayProvider,
  useDatePickerOverlay,
  DatePickerRangeGridPanel,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  DatePickerTrigger,
  SingleDateSelectionContext,
  DateRangeSelectionContext,
  useDatePickerContext,
} from "@salt-ds/date-components";

export type {
  DatePickerProps,
  DatePickerActionsProps,
  DatePickerOpenChangeReason,
  DatePickerRangeGridPanelProps,
  DatePickerSingleGridPanelProps,
  DatePickerState,
  SingleDatePickerState,
  RangeDatePickerState,
  UseDatePickerContextProps,
} from "@salt-ds/date-components";









