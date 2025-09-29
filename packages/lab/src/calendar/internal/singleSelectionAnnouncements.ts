import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  AnnouncementVariant,
  isSingleSelectionState,
  isMultiselectSingleSelectionState,
  UseAriaCalendarAnnouncerProps,
} from "../useAriaCalendarAnnouncer";

export function singleSelectionAnnouncements<TDate extends DateFrameworkType>(
  variant: AnnouncementVariant,
  state: UseAriaCalendarAnnouncerProps<TDate>["state"],
  dateAdapter: SaltDateAdapter<TDate>,
) {
  if (
    isSingleSelectionState(state) ||
    isMultiselectSingleSelectionState(state)
  ) {
    const { multiselect, selectedDate, startVisibleMonth, endVisibleMonth } =
      state;

    if (variant === "minFocusableDateExceeded") {
      return "cannot focus before minimum date";
    } else if (variant === "maxFocusableDateExceeded") {
      return "cannot focus beyond maximum date";
    }

    if (variant === "dateSelected") {
      if (!selectedDate) {
        return "cleared date selection";
      } else if (multiselect) {
        const lastSelectedDate = selectedDate[selectedDate.length - 1];
        return `${dateAdapter.format(lastSelectedDate, `dddd D MMMM YYYY`)}, selected, ${selectedDate.length} dates in selection`;
      } else {
        return `${dateAdapter.format(selectedDate, `dddd D MMMM YYYY`)}, selected`;
      }
      /** Visible month changed */
    } else if (variant === "visibleMonthChanged") {
      const isSingleMonth = dateAdapter.isSame(
        startVisibleMonth,
        endVisibleMonth,
        "month",
      );
      if (isSingleMonth) {
        return `Visible month starts from ${dateAdapter.format(startVisibleMonth, `dddd D MMMM YYYY`)}`;
      } else {
        const endOfMonth = dateAdapter.endOf(endVisibleMonth, "month");
        return `Visible months are from ${dateAdapter.format(
          startVisibleMonth,
          `dddd D MMMM YYYY`,
        )} to ${dateAdapter.format(endOfMonth, `dddd D MMMM YYYY`)}`;
      }
    }
  }
}
