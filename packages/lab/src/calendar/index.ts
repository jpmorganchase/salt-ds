import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar as _Calendar,
  CalendarGrid as _CalendarGrid,
  CalendarNavigation as _CalendarNavigation,
  CalendarWeekHeader as _CalendarWeekHeader,
  isDateRangeSelection as _isDateRangeSelection,
  useCalendar as _useCalendar,
  useCalendarDay as _useCalendarDay,
  useCalendarSelection as _useCalendarSelection,
  useCalendarSelectionDay as _useCalendarSelectionDay,
  useDateSelectionAnnouncer as _useDateSelectionAnnouncer,
  type DateRangeSelection,
} from "@salt-ds/date-components";
import {
  deprecatedComponent,
  deprecatedFunction,
} from "../utils/deprecatedExport";

const KEY = "@salt-ds/lab/calendar";
const MSG =
  "@salt-ds/lab 'calendar' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.";

const _warnOnce = deprecatedFunction(() => {}, KEY, MSG);

// Components
export const Calendar = deprecatedComponent(_Calendar, "Calendar", KEY, MSG);
export const CalendarGrid = deprecatedComponent(
  _CalendarGrid,
  "CalendarGrid",
  KEY,
  MSG,
);
export const CalendarNavigation = deprecatedComponent(
  _CalendarNavigation,
  "CalendarNavigation",
  KEY,
  MSG,
);
export const CalendarWeekHeader = deprecatedComponent(
  _CalendarWeekHeader,
  "CalendarWeekHeader",
  KEY,
  MSG,
);

// Hooks
export const useCalendar = deprecatedFunction(_useCalendar, KEY, MSG);
export const useCalendarDay = deprecatedFunction(_useCalendarDay, KEY, MSG);
export const useCalendarSelection = deprecatedFunction(
  _useCalendarSelection,
  KEY,
  MSG,
);
export const useCalendarSelectionDay = deprecatedFunction(
  _useCalendarSelectionDay,
  KEY,
  MSG,
);
export const useDateSelectionAnnouncer = deprecatedFunction(
  _useDateSelectionAnnouncer,
  KEY,
  MSG,
);

// Generic function — explicit wrapper to preserve type parameters
export function isDateRangeSelection<
  TDate extends DateFrameworkType = DateFrameworkType,
>(value: unknown): value is DateRangeSelection<TDate> {
  _warnOnce();
  return _isDateRangeSelection<TDate>(value);
}

// Types
export type {
  CalendarBaseProps,
  CalendarDayProps,
  CalendarGridProps,
  CalendarMultiselectOffsetProps,
  CalendarMultiselectRangeProps,
  CalendarMultiselectSingleProps,
  CalendarNavigationProps,
  CalendarOffsetProps,
  CalendarProps,
  CalendarRangeProps,
  CalendarSingleProps,
  CalendarWeekHeaderProps,
  CreateAnnouncement,
  DateRangeSelection,
  DayStatus,
  renderCalendarDayProps,
  SelectionVariant,
  SingleDateSelection,
  UseCalendarMultiselectOffsetProps,
  UseCalendarMultiselectRangeProps,
  UseCalendarMultiselectSingleProps,
  UseCalendarOffsetProps,
  UseCalendarProps,
  UseCalendarRangeProps,
  UseCalendarReturn,
  UseCalendarSelectionBaseProps,
  UseCalendarSelectionMultiselectOffsetProps,
  UseCalendarSelectionMultiselectRangeProps,
  UseCalendarSelectionMultiselectSingleProps,
  UseCalendarSelectionOffsetProps,
  UseCalendarSelectionProps,
  UseCalendarSelectionRangeProps,
  UseCalendarSelectionSingleProps,
  UseCalendarSingleProps,
  useCalendarDayProps,
} from "@salt-ds/date-components";
