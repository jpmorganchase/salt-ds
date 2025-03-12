import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { type ReactNode, forwardRef } from "react";
import {
  DateRangeSelectionContext,
  type RangeDatePickerState,
  type SingleDatePickerState,
  SingleDateSelectionContext,
} from "./DatePickerContext";
import {
  type DatePickerOpenChangeReason,
  DatePickerOverlayProvider,
} from "./DatePickerOverlayProvider";
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
  /** When `open` is uncontrolled, set this to `true` to open on click */
  openOnClick?: boolean;
  /**
   * Handler for when open state changes
   * @param newOpen - true when opened
   * @param event - event that triggered the state change
   * @param reason - reason for the the state change
   */
  onOpenChange?: (
    newOpen: boolean,
    event?: Event,
    reason?: DatePickerOpenChangeReason,
  ) => void;
  /**
   * the initial open/close state of the overlay, when the open/close state is un-controlled.
   */
  defaultOpen?: DatePickerBaseProps["open"];
}

/**
 * Props for the DatePicker component, when `selectionVariant` is `single`.
 * @template T
 */
export interface DatePickerSingleProps<TDate extends DateFrameworkType>
  extends DatePickerBaseProps,
    UseDatePickerSingleProps<TDate> {
  selectionVariant: "single";
}

/**
 * Props for the DatePicker component, when `selectionVariant` is `range`.
 * @template T
 */
export interface DatePickerRangeProps<TDate extends DateFrameworkType>
  extends DatePickerBaseProps,
    UseDatePickerRangeProps<TDate> {
  selectionVariant: "range";
}

/**
 * Props for the DatePicker component.
 * @template T
 */
export type DatePickerProps<TDate extends DateFrameworkType> =
  | DatePickerSingleProps<TDate>
  | DatePickerRangeProps<TDate>;

export const DatePickerMain = forwardRef<HTMLDivElement, DatePickerProps<any>>(
  <TDate extends DateFrameworkType>(
    props: DatePickerProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
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
      onCancel,
    };

    if (props.selectionVariant === "range") {
      const stateAndHelpers = useDatePicker<TDate, "range">(
        useDatePickerProps,
        ref,
      ) as RangeDatePickerState<TDate>;
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
    ) as SingleDatePickerState<TDate>;

    return (
      <SingleDateSelectionContext.Provider value={stateAndHelpers}>
        <div ref={stateAndHelpers?.state?.containerRef} {...rest}>
          {children}
        </div>
      </SingleDateSelectionContext.Provider>
    );
  },
);

export const DatePicker = forwardRef(function DatePicker<
  TDate extends DateFrameworkType,
>(props: DatePickerProps<TDate>, ref: React.Ref<HTMLDivElement>) {
  const { defaultOpen, open, openOnClick, onOpenChange, readOnly, ...rest } =
    props;

  return (
    <DatePickerOverlayProvider
      defaultOpen={defaultOpen}
      open={open}
      openOnClick={openOnClick}
      onOpenChange={onOpenChange}
      readOnly={readOnly}
    >
      <DatePickerMain {...rest} readOnly={readOnly} ref={ref} />
    </DatePickerOverlayProvider>
  );
});
