import React, { forwardRef } from "react";
import {
  DatePickerSingleGridPanel,
  DatePickerSingleGridPanelProps,
} from "./DatePickerSingleGridPanel";
import { DateFrameworkType } from "@salt-ds/date-adapters";

/**
 * @deprecated DatePickerSinglePanel is deprecated. Use DatePickerSingleGridPanel instead.
 * This component will be deleted when we move DatePickerSingleGridPanel from labs to core.
 */
export const DatePickerSinglePanel = forwardRef(function DatePickerSinglePanel<
  TDate,
>(
  props: DatePickerSingleGridPanelProps<TDate>,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <DatePickerSingleGridPanel
      ref={ref}
      columns={1}
      numberOfVisibleMonths={1}
      {...(props as DatePickerSingleGridPanelProps<DateFrameworkType>)}
    />
  );
});
