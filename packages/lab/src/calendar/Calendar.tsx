import { makePrefixer, type ResponsiveProp } from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { useLocalization } from "../localization-provider";
import calendarCss from "./Calendar.css";
import { CalendarContext } from "./internal/CalendarContext";
import {
  type UseCalendarMultiselectOffsetProps,
  type UseCalendarMultiselectRangeProps,
  type UseCalendarMultiselectSingleProps,
  type UseCalendarOffsetProps,
  type UseCalendarRangeProps,
  type UseCalendarSingleProps,
  useCalendar,
} from "./useCalendar";
import type { DateRangeSelection } from "./useCalendarSelection";

/**
 * Base props for the Calendar component.
 */
export interface CalendarBaseProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content to be rendered inside the Calendar.
   */
  children: ReactNode;
  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: boolean;
  /**
   * Ref to attach to the focused element,enabling focus to be controlled.
   */
  focusedDateRef?: React.MutableRefObject<HTMLElement | null>;
  /**
   * Number of visible months, maximum 12, defaults to 1
   */
  numberOfVisibleMonths?: ResponsiveProp<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  >;
  /**
   * Specifies the timezone behavior:
   * - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate`.
   * - If set to "default", the default timezone of the date library will be used.
   * - If set to "system", the local system's timezone will be applied.
   * - If set to "UTC", the time will be returned in UTC.
   * - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
   */
  timezone?: Timezone;
  /**
   * If `true`, the calendar will be multiselect.
   */
  multiselect?: boolean;
}

/**
 * Props for the Calendar component with single date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarSingleProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarSingleProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * Props for the Calendar component with multi-select, date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarMultiselectSingleProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarMultiselectSingleProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
  /**
   * Multiple selection
   */
  multiselect: true;
}

/**
 * Props for the Calendar component with date range selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarRangeProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarRangeProps<TDate> {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * Props for the Calendar component with multi-select, date range selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarMultiselectRangeProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarMultiselectRangeProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "range";
  /**
   * Multiple selection
   */
  multiselect: true;
}

/**
 * Props for the Calendar component with offset date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarOffsetProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarOffsetProps<TDate> {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
}

/**
 * Props for the Calendar component with multi-select, offset date selection.
 * @template TDate - The type of the date object.
 */
export interface CalendarMultiselectOffsetProps<TDate extends DateFrameworkType>
  extends CalendarBaseProps,
    UseCalendarMultiselectOffsetProps<TDate> {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
  /**
   * Multiple selection
   */
  multiselect: true;
}

/**
 * Type representing the props for the Calendar component with various selection variants.
 * @template TDate - The type of the date object.
 */
export type CalendarProps<TDate extends DateFrameworkType> =
  | CalendarSingleProps<TDate>
  | CalendarMultiselectSingleProps<TDate>
  | CalendarRangeProps<TDate>
  | CalendarMultiselectRangeProps<TDate>
  | CalendarOffsetProps<TDate>
  | CalendarMultiselectOffsetProps<TDate>;

const withBaseName = makePrefixer("saltCalendar");

function isMultiselect<TDate>(
  props: CalendarProps<TDate>,
): props is
  | CalendarMultiselectSingleProps<TDate>
  | CalendarMultiselectRangeProps<TDate>
  | CalendarMultiselectOffsetProps<TDate> {
  return props.multiselect === true;
}

function getStartOrEndDate<TDate>(
  dateRange:
    | DateRangeSelection<TDate>
    | DateRangeSelection<TDate>[]
    | undefined,
  isMultiselect: boolean,
): TDate | null | undefined {
  if (isMultiselect) {
    const rangeArray = dateRange as DateRangeSelection<TDate>[];
    return rangeArray?.[0]?.startDate ?? rangeArray?.[0]?.endDate;
  }
  const range = dateRange as DateRangeSelection<TDate>;
  return range?.startDate ?? range?.endDate;
}

let warnedOnce = false;

export const Calendar = forwardRef<
  HTMLDivElement,
  CalendarProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: CalendarProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const targetWindow = useWindow();
    const { dateAdapter } = useLocalization<TDate>();
    useComponentCssInjection({
      testId: "salt-calendar",
      css: calendarCss,
      window: targetWindow,
    });
    const {
      children,
      className,
      selectedDate,
      defaultSelectedDate,
      visibleMonth: visibleMonthProp,
      defaultVisibleMonth,
      onFocusedDateChange,
      onSelectionChange,
      onVisibleMonthChange,
      hideOutOfRangeDates,
      focusedDate,
      focusedDateRef,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      minDate,
      maxDate,
      multiselect,
      numberOfVisibleMonths = 1,
      select,
      selectionVariant,
      onHoveredDateChange,
      hoveredDate,
      timezone: timezoneProp,
      ...propsRest
    } = props;

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (!warnedOnce && multiselect && selectionVariant !== "single") {
          console.warn(
            `'multiselect' with selection variant '${selectionVariant}' is experimental and not for production use.`,
          );
          warnedOnce = true;
        }
      }
    }, [multiselect, warnedOnce, selectionVariant]);

    let timezone: Timezone = "default";
    if (timezoneProp) {
      timezone = timezoneProp;
    } else {
      let defaultTimezoneDate: TDate | null | undefined;

      if (selectionVariant === "range" || selectionVariant === "offset") {
        const shouldExtractFromList = isMultiselect(props);
        defaultTimezoneDate =
          getStartOrEndDate(selectedDate, shouldExtractFromList) ??
          getStartOrEndDate(defaultSelectedDate, shouldExtractFromList);
      } else if (selectionVariant === "single") {
        if (isMultiselect(props)) {
          defaultTimezoneDate =
            (defaultSelectedDate as TDate[])?.[0] ?? undefined;
        } else {
          defaultTimezoneDate =
            (selectedDate as TDate | null) ??
            (defaultSelectedDate as TDate | null);
        }
      }
      if (defaultTimezoneDate) {
        timezone = dateAdapter.getTimezone(defaultTimezoneDate);
      }
    }

    let startDateOffset: CalendarOffsetProps<TDate>["startDateOffset"];
    let endDateOffset: CalendarOffsetProps<TDate>["startDateOffset"];
    let rest: Partial<typeof props>;
    if (selectionVariant === "offset") {
      ({ startDateOffset, endDateOffset, ...rest } =
        propsRest as CalendarOffsetProps<TDate>);
    } else {
      rest = propsRest;
    }
    const defaultFocusedDateRef = useRef(null);

    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useCalendarProps: any = {
      selectedDate,
      defaultSelectedDate,
      visibleMonth: visibleMonthProp,
      defaultVisibleMonth,
      onSelectionChange,
      onVisibleMonthChange,
      focusedDate,
      focusedDateRef:
        focusedDateRef !== undefined ? focusedDateRef : defaultFocusedDateRef,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      multiselect,
      minDate,
      maxDate,
      numberOfVisibleMonths,
      select,
      selectionVariant,
      onFocusedDateChange,
      onHoveredDateChange,
      hideOutOfRangeDates,
      hoveredDate,
      startDateOffset,
      endDateOffset,
      timezone,
    };
    const { state, helpers } = useCalendar<TDate>(useCalendarProps);
    const calendarLabel = dateAdapter.format(state.visibleMonth, "MMMM YYYY");

    return (
      <CalendarContext.Provider
        value={{
          state,
          helpers,
        }}
      >
        <div
          className={clsx(withBaseName(), className)}
          role="application"
          aria-label={calendarLabel}
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </CalendarContext.Provider>
    );
  },
);
