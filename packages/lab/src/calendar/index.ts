import { warnOnce } from "../utils/deprecate";

warnOnce({
  key: "@salt-ds/lab/calendar",
  message:
    "@salt-ds/lab 'calendar' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.",
});

export {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  useCalendar,
  useCalendarDay,
  useCalendarSelection,
  useCalendarSelectionDay,
  isDateRangeSelection,
  useDateSelectionAnnouncer,
} from "@salt-ds/date-components";

export type {
  CalendarProps,
  CalendarBaseProps,
  CalendarSingleProps,
  CalendarMultiselectSingleProps,
  CalendarRangeProps,
  CalendarMultiselectRangeProps,
  CalendarOffsetProps,
  CalendarMultiselectOffsetProps,
  CalendarGridProps,
  CalendarNavigationProps,
  CalendarWeekHeaderProps,
  CalendarDayProps,
  renderCalendarDayProps,
  UseCalendarProps,
  UseCalendarReturn,
  UseCalendarSingleProps,
  UseCalendarMultiselectSingleProps,
  UseCalendarRangeProps,
  UseCalendarMultiselectRangeProps,
  UseCalendarOffsetProps,
  UseCalendarMultiselectOffsetProps,
  DayStatus,
  useCalendarDayProps,
  SingleDateSelection,
  DateRangeSelection,
  SelectionVariant,
  UseCalendarSelectionBaseProps,
  UseCalendarSelectionProps,
  UseCalendarSelectionSingleProps,
  UseCalendarSelectionMultiselectSingleProps,
  UseCalendarSelectionRangeProps,
  UseCalendarSelectionMultiselectRangeProps,
  UseCalendarSelectionOffsetProps,
  UseCalendarSelectionMultiselectOffsetProps,
  CreateAnnouncement,
} from "@salt-ds/date-components";
