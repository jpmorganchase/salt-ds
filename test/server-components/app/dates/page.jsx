import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
} from "@salt-ds/date-components";
import { DateProvider } from "./DateProvider";

export default function DatesPage() {
  return (
    <DateProvider>
      <Calendar selectionVariant="single">
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    </DateProvider>
  );
}
