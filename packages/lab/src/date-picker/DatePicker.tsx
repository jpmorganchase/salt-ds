import { forwardRef, ReactNode } from "react";
import { DatePickerContext } from "./DatePickerContext";
import { useDatePicker, useDatePickerSingleProps, useDatePickerRangeProps } from "./useDatePicker";

export interface DatePickerBaseProps {
  className?: string;
  children: ReactNode;
}

export interface DatePickerSingleProps
  extends DatePickerBaseProps, useDatePickerSingleProps {
  selectionVariant: "single";
}

export interface DatePickerRangeProps
  extends DatePickerBaseProps, useDatePickerRangeProps {
  selectionVariant: "range";
}

export type DatePickerProps =
  | DatePickerSingleProps
  | DatePickerRangeProps;

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const { className, children, ...rest } = props;
    const { state, helpers } = useDatePicker(rest, ref);
    return (
      <DatePickerContext.Provider
        value={{
          state,
          helpers,
        }}
      >
        <div className={className} ref={state.containerRef}>
          {children}
        </div>
      </DatePickerContext.Provider>
    );
  }
);
