import type { Timezone } from "@salt-ds/date-adapters";
import { forwardRef, type ReactNode } from "react";
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
   * @param reason - reason for the the state change
   */
  onOpenChange?: (
    newOpen: boolean,
    reason?: DatePickerOpenChangeReason,
  ) => void;
  /**
   * the initial open/close state of the overlay, when the open/close state is un-controlled.
   */
  defaultOpen?: DatePickerBaseProps["open"];
  /**
   * Specifies the timezone behavior:
   * - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate`.
   * - If set to "default", the default timezone of the date library will be used.
   * - If set to "system", the local system's timezone will be applied.
   * - If set to "UTC", the time will be returned in UTC.
   * - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
   */
  timezone?: Timezone;
}

/**
 * Props for the DatePicker component, when `selectionVariant` is `single`.
 */
export interface DatePickerSingleProps
  extends DatePickerBaseProps,
    UseDatePickerSingleProps {
  selectionVariant: "single";
}

/**
 * Props for the DatePicker component, when `selectionVariant` is `range`.
 */
export interface DatePickerRangeProps
  extends DatePickerBaseProps,
    UseDatePickerRangeProps {
  selectionVariant: "range";
}

/**
 * Props for the DatePicker component.
 */
export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

export const DatePickerMain = forwardRef<HTMLDivElement, DatePickerProps>(
  (props: DatePickerProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      createAnnouncement,
      children,
      readOnly,
      disabled,
      isDayHighlighted,
      isDayUnselectable,
      selectionVariant,
      defaultSelectedDate,
      selectedDate,
      onSelectionChange,
      onApply,
      minDate,
      maxDate,
      onCancel,
      timezone,
      ...rest
    } = props;
    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useDatePickerProps: any = {
      createAnnouncement,
      readOnly,
      disabled,
      isDayHighlighted,
      isDayUnselectable,
      selectionVariant,
      defaultSelectedDate,
      selectedDate,
      onSelectionChange,
      onApply,
      minDate,
      maxDate,
      onCancel,
      timezone,
    };

    const stateAndHelpers = useDatePicker(useDatePickerProps, ref);

    if (props.selectionVariant === "range") {
      return (
        <DateRangeSelectionContext.Provider
          value={stateAndHelpers as RangeDatePickerState}
        >
          <div ref={stateAndHelpers?.state?.containerRef} {...rest}>
            {children}
          </div>
        </DateRangeSelectionContext.Provider>
      );
    }

    return (
      <SingleDateSelectionContext.Provider
        value={stateAndHelpers as SingleDatePickerState}
      >
        <div ref={stateAndHelpers?.state?.containerRef} {...rest}>
          {children}
        </div>
      </SingleDateSelectionContext.Provider>
    );
  },
);

export const DatePicker = forwardRef(function DatePicker(
  props: DatePickerProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { defaultOpen, open, openOnClick, onOpenChange, readOnly, ...rest } =
    props;

  return (
    <DatePickerOverlayProvider
      disabled={rest.disabled}
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
