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
}

/**
 * Props for the Calendar component with single date selection.
 */
export interface CalendarSingleProps
  extends CalendarBaseProps,
    UseCalendarSingleProps {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * Props for the Calendar component with multi-select, date selection.
 */
export interface CalendarMultiselectSingleProps
  extends CalendarBaseProps,
    UseCalendarMultiselectSingleProps {
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
 */
export interface CalendarRangeProps
  extends CalendarBaseProps,
    UseCalendarRangeProps {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * Props for the Calendar component with multi-select, date range selection.
 */
export interface CalendarMultiselectRangeProps
  extends CalendarBaseProps,
    UseCalendarMultiselectRangeProps {
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
 */
export interface CalendarOffsetProps
  extends CalendarBaseProps,
    UseCalendarOffsetProps {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
}

/**
 * Props for the Calendar component with multi-select, offset date selection.
 */
export interface CalendarMultiselectOffsetProps
  extends CalendarBaseProps,
    UseCalendarMultiselectOffsetProps {
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
 */
export type CalendarProps =
  | CalendarSingleProps
  | CalendarMultiselectSingleProps
  | CalendarRangeProps
  | CalendarMultiselectRangeProps
  | CalendarOffsetProps
  | CalendarMultiselectOffsetProps;

const withBaseName = makePrefixer("saltCalendar");

function isMultiselect(
  props: CalendarProps,
): props is
  | CalendarMultiselectSingleProps
  | CalendarMultiselectRangeProps
  | CalendarMultiselectOffsetProps {
  return props.multiselect === true;
}

function getStartOrEndDate(
  dateRange: DateRangeSelection | DateRangeSelection[] | undefined,
  isMultiselect: boolean,
): DateFrameworkType | null | undefined {
  if (isMultiselect) {
    const rangeArray = dateRange as DateRangeSelection[];
    return rangeArray?.[0]?.startDate ?? rangeArray?.[0]?.endDate;
  }
  const range = dateRange as DateRangeSelection;
  return range?.startDate ?? range?.endDate;
}

let warnedOnce = false;

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (props: CalendarProps, ref: React.Ref<HTMLDivElement>) => {
    const targetWindow = useWindow();
    const { dateAdapter } = useLocalization();
    useComponentCssInjection({
      testId: "salt-calendar",
      css: calendarCss,
      window: targetWindow,
    });
    const {
      createAnnouncement,
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
      let defaultTimezoneDate: DateFrameworkType | null | undefined;

      if (selectionVariant === "range" || selectionVariant === "offset") {
        const shouldExtractFromList = isMultiselect(props);
        defaultTimezoneDate =
          getStartOrEndDate(selectedDate, shouldExtractFromList) ??
          getStartOrEndDate(defaultSelectedDate, shouldExtractFromList);
      } else if (selectionVariant === "single") {
        if (isMultiselect(props)) {
          defaultTimezoneDate =
            (defaultSelectedDate as DateFrameworkType[])?.[0] ?? undefined;
        } else {
          defaultTimezoneDate =
            (selectedDate as DateFrameworkType | null) ??
            (defaultSelectedDate as DateFrameworkType | null);
        }
      }
      if (defaultTimezoneDate) {
        timezone = dateAdapter.getTimezone(defaultTimezoneDate);
      }
    }

    let startDateOffset: CalendarOffsetProps["startDateOffset"];
    let endDateOffset: CalendarOffsetProps["startDateOffset"];
    let rest: Partial<typeof props>;
    if (selectionVariant === "offset") {
      ({ startDateOffset, endDateOffset, ...rest } =
        propsRest as CalendarOffsetProps);
    } else {
      rest = propsRest;
    }
    const defaultFocusedDateRef = useRef(null);

    // biome-ignore lint/suspicious/noExplicitAny: type guard
    const useCalendarProps: any = {
      createAnnouncement,
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
    const { state, helpers } = useCalendar(useCalendarProps);
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
