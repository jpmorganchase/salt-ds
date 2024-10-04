import { CalendarDate } from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Multiselect = (): ReactElement => (
  <Calendar
    hideOutOfRangeDates
    selectionVariant="multiselect"
    defaultVisibleMonth={new CalendarDate(2024, 1, 1)}
    defaultSelectedDate={[
      new CalendarDate(2024, 1, 2),
      new CalendarDate(2024, 1, 3),
      new CalendarDate(2024, 1, 4),
      new CalendarDate(2024, 1, 5),
      new CalendarDate(2024, 1, 6),
      new CalendarDate(2024, 1, 11),
      new CalendarDate(2024, 1, 18),
      new CalendarDate(2024, 1, 22),
      new CalendarDate(2024, 1, 25),
      new CalendarDate(2024, 1, 30),
      new CalendarDate(2024, 1, 31),
      new CalendarDate(2024, 2, 1),
      new CalendarDate(2024, 2, 2),
      new CalendarDate(2024, 2, 3),
      new CalendarDate(2024, 2, 4),
      new CalendarDate(2024, 2, 8),
      new CalendarDate(2024, 2, 11),
      new CalendarDate(2024, 2, 15),
      new CalendarDate(2024, 2, 16),
      new CalendarDate(2024, 2, 17),
      new CalendarDate(2024, 2, 18),
      new CalendarDate(2024, 2, 22),
      new CalendarDate(2024, 2, 29),
      new CalendarDate(2024, 3, 6),
      new CalendarDate(2024, 3, 7),
      new CalendarDate(2024, 3, 8),
      new CalendarDate(2024, 3, 9),
      new CalendarDate(2024, 3, 10),
      new CalendarDate(2024, 3, 13),
      new CalendarDate(2024, 3, 15),
      new CalendarDate(2024, 3, 17),
      new CalendarDate(2024, 3, 20),
      new CalendarDate(2024, 3, 22),
      new CalendarDate(2024, 3, 24),
      new CalendarDate(2024, 3, 27),
      new CalendarDate(2024, 3, 31),
    ]}
  >
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
