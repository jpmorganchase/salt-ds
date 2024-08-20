import { type ReactNode, forwardRef } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  type DatePickerState,
  DateRangeSelectionContext,
  SingleDateSelectionContext,
} from "./DatePickerContext";
import { DatePickerOverlayProvider } from "./DatePickerOverlayProvider";
import {
  type UseDatePickerRangeProps,
  type UseDatePickerSingleProps,
  useDatePicker,
} from "./useDatePicker";

export interface DatePickerBaseProps {
  className?: string;
  children?: ReactNode;
}

export interface DatePickerSingleProps
  extends DatePickerBaseProps,
    UseDatePickerSingleProps {
  selectionVariant: "single";
}

export interface DatePickerRangeProps
  extends DatePickerBaseProps,
    UseDatePickerRangeProps {
  selectionVariant: "range";
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

export const DatePickerMain = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePickerMain(props, ref) {
    const { className, children, ...rest } = props;
    if (props.selectionVariant === "range") {
      const stateAndHelpers = useDatePicker(
        rest,
        ref,
      ) as DatePickerState<DateRangeSelection>;
      return (
        <DateRangeSelectionContext.Provider value={stateAndHelpers}>
          <div className={className} ref={stateAndHelpers?.state?.containerRef}>
            {children}
          </div>
        </DateRangeSelectionContext.Provider>
      );
    }
    const stateAndHelpers = useDatePicker(
      rest,
      ref,
    ) as DatePickerState<SingleDateSelection>;
    return (
      <SingleDateSelectionContext.Provider value={stateAndHelpers}>
        <div className={className} ref={stateAndHelpers?.state?.containerRef}>
          {children}
        </div>
      </SingleDateSelectionContext.Provider>
    );
  },
);

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const { open, defaultOpen, ...rest } = props;

    return (
      <DatePickerOverlayProvider open={open} defaultOpen={defaultOpen}>
        <DatePickerMain {...rest} ref={ref} />
      </DatePickerOverlayProvider>
    );
  },
);
