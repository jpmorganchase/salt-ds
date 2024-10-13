import { type ReactNode, forwardRef } from "react";
import {
  DateRangeSelectionContext,
  type RangeDatePickerState,
  type SingleDatePickerState,
  SingleDateSelectionContext,
} from "./DatePickerContext";
import { DatePickerOverlayProvider } from "./DatePickerOverlayProvider";
import {
  type UseDatePickerRangeProps,
  type UseDatePickerSingleProps,
  useDatePicker,
} from "./useDatePicker";

/**
 * Base props for DatePicker.
 */
export interface DatePickerBaseProps {
  className?: string;
  children?: ReactNode;
  /** the open/close state of the overlay. The open/close state will be controlled when this prop is provided. */
  open?: boolean;
  /**
   * Handler for when open state changes
   * @param newOpen - true when opened
   */
  onOpen?: (newOpen:boolean) => void
  /**
   * the initial open/close state of the overlay, when the open/close state is un-controlled.
   */
  defaultOpen?: DatePickerBaseProps["open"];
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
    const {
      children,
      readOnly,
      disabled,
      selectionVariant,
      defaultSelectedDate,
      selectedDate,
      onSelectionChange,
      onApply,
      minDate,
      maxDate,
      timeZone,
      locale,
      onCancel,
      ...rest
    } = props;
    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useDatePickerProps: any = {
      readOnly,
      disabled,
      selectionVariant,
      defaultSelectedDate,
      selectedDate,
      onSelectionChange,
      onApply,
      minDate,
      maxDate,
      timeZone,
      locale,
      onCancel,
    };
    if (props.selectionVariant === "range") {
      const stateAndHelpers = useDatePicker(
        useDatePickerProps,
        ref,
      ) as RangeDatePickerState;
      return (
        <DateRangeSelectionContext.Provider value={stateAndHelpers}>
          <div ref={stateAndHelpers?.state?.containerRef} {...rest}>
            {children}
          </div>
        </DateRangeSelectionContext.Provider>
      );
    }
    const stateAndHelpers = useDatePicker(
      useDatePickerProps,
      ref,
    ) as SingleDatePickerState;
    return (
      <SingleDateSelectionContext.Provider value={stateAndHelpers}>
        <div ref={stateAndHelpers?.state?.containerRef} {...rest}>
          {children}
        </div>
      </SingleDateSelectionContext.Provider>
    );
  },
);

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const { open, defaultOpen, onOpen, ...rest } = props;

    return (
      <DatePickerOverlayProvider open={open} defaultOpen={defaultOpen} onOpen={onOpen}>
        <DatePickerMain {...rest} ref={ref} />
      </DatePickerOverlayProvider>
    );
  },
);
