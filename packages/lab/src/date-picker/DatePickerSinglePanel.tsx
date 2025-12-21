import { forwardRef } from "react";
import {
  DatePickerSingleGridPanel,
  type DatePickerSingleGridPanelProps,
} from "./DatePickerSingleGridPanel";

/**
 * @deprecated DatePickerSinglePanel is deprecated. Use DatePickerSingleGridPanel instead.
 * This component will be deleted when we move DatePickerSingleGridPanel from labs to core.
 */
export const DatePickerSinglePanel = forwardRef(function DatePickerSinglePanel(
  props: DatePickerSingleGridPanelProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <DatePickerSingleGridPanel
      ref={ref}
      columns={1}
      numberOfVisibleMonths={1}
      {...props}
    />
  );
});
