import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  AnnouncementVariant,
  isRangeSelectionState,
  isMultiselectRangeSelectionState,
  UseAriaCalendarAnnouncerProps,
} from "../useAriaCalendarAnnouncer";

export function rangeSelectionAnnouncements<TDate extends DateFrameworkType>(
  variant: AnnouncementVariant,
  state: UseAriaCalendarAnnouncerProps<TDate>["state"],
  dateAdapter: SaltDateAdapter<TDate>,
) {
  if (isRangeSelectionState(state) || isMultiselectRangeSelectionState(state)) {
    const { multiselect, selectedDate, startVisibleMonth, endVisibleMonth } =
      state;

    if (variant === "minFocusableDateExceeded") {
      return "cannot focus before minimum date";
    } else if (variant === "maxFocusableDateExceeded") {
      return "cannot focus beyond maximum date";
    }

    /** Date selected */
    if (variant === "dateSelected") {
      if (!selectedDate || (multiselect && !selectedDate.length)) {
        return "cleared date selection";
      }
      const { startDate, endDate } = multiselect
        ? selectedDate[selectedDate.length - 1]
        : (selectedDate ?? {});
      if (startDate && !endDate) {
        return `Selected start date ${dateAdapter.format(startDate, `dddd D MMMM YYYY`)}`;
      } else if (!startDate && endDate) {
        return `${dateAdapter.format(endDate, `dddd D MMMM YYYY`)}, selected as end date`;
      } else if (startDate && endDate) {
        const multiselectSuffix = multiselect
          ? `, ${selectedDate.length > 1 ? `${selectedDate.length} date ranges in selection` : ""}`
          : "";
        return `Date range ${dateAdapter.format(startDate, `dddd D MMMM YYYY`)} to ${dateAdapter.format(endDate, `dddd D MMMM YYYY`)}, selected${multiselectSuffix}`;
      }
      /** Visible month changed */
    } else if (variant === "visibleMonthChanged") {
      const isSingleMonth = dateAdapter.isSame(
        startVisibleMonth,
        endVisibleMonth,
        "month",
      );
      if (isSingleMonth) {
        return `Visible month starts from ${dateAdapter.format(
          startVisibleMonth,
          `dddd D MMMM YYYY`,
        )}`;
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
