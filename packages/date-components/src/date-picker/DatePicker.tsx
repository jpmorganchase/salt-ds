import type { Timezone } from "@salt-ds/date-adapters";
import { Children, forwardRef, isValidElement, type ReactNode } from "react";
import { DatePickerActions } from "./DatePickerActions";
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

let hasDatePickerActionsWarningShown = false;

function hasDatePickerActions(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) {
      return false;
    }

    if (child.type === DatePickerActions) {
      return true;
    }

    return hasDatePickerActions(
      (child.props as { children?: ReactNode }).children,
    );
  });
}

/**
 * Base props for DatePicker.
 */
export interface DatePickerBaseProps {
  className?: string;
  children?: ReactNode;
  /**
   * If `true`, enables apply mode where selections are not committed until explicitly applied.
   * This is required when using a modal DatePicker with confirmation controls (e.g., DatePickerActions).
   * When enabled, date selections remain pending until the user explicitly applies them.
   */
  enableApply?: boolean;
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
      enableApply: enableApplyProp,
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

    // Only detect DatePickerActions if enableApply is not explicitly provided
    const hasActionsDetected =
      enableApplyProp === undefined ? hasDatePickerActions(children) : false;
    const enableApply =
      enableApplyProp !== undefined ? enableApplyProp : hasActionsDetected;

    // Deprecation warning for hasDatePickerActions detection (only once globally in dev mode)
    if (
      process.env.NODE_ENV === "development" &&
      !hasDatePickerActionsWarningShown &&
      hasActionsDetected
    ) {
      hasDatePickerActionsWarningShown = true;
      console.warn(
        "DatePicker: Automatic detection of DatePickerActions via hasDatePickerActions is deprecated. " +
          "Please explicitly pass the `enableApply` prop to DatePicker instead. " +
          "This automatic detection will be removed in a future version.",
      );
    }

    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useDatePickerProps: any = {
      createAnnouncement,
      enableApply,
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
