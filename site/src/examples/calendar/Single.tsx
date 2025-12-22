import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Single = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  return (
    <Calendar
      selectionVariant={"single"}
      defaultSelectedDate={dateAdapter.today()}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
