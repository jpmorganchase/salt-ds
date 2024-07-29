import { type ReactNode, forwardRef } from "react";
import {
  DatePickerState,
  SingleDateSelectionContext,
  DateRangeSelectionContext,
} from "./DatePickerContext";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  useDatePicker,
  type UseDatePickerRangeProps,
  type UseDatePickerSingleProps,
} from "./useDatePicker";
import { DatePickerOverlayProvider } from "./DatePickerOverlayProvider";

export interface DatePickerBaseProps {
  className?: string;
  children: ReactNode;
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
            <div
              className={className}
              ref={stateAndHelpers?.state?.containerRef}
            >
              {children}
            </div>
        </DateRangeSelectionContext.Provider>
      );
    } else {
      const stateAndHelpers = useDatePicker(
        rest,
        ref,
      ) as DatePickerState<SingleDateSelection>;
      return (
          <SingleDateSelectionContext.Provider value={stateAndHelpers}>
            <div
              className={className}
              ref={stateAndHelpers?.state?.containerRef}
            >
              {children}
            </div>
          </SingleDateSelectionContext.Provider>
      );
    }
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
  }
);
