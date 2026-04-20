import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";

export type AnnouncementType =
  | "minFocusableDateExceeded"
  | "maxFocusableDateExceeded"
  | "dateSelected"
  | "visibleMonthChanged";

export type AnnouncerMinMaxFocusState = Record<string, never>;

export interface AnnouncerVisibleMonthState {
  startVisibleMonth: DateFrameworkType;
  endVisibleMonth: DateFrameworkType;
}

export interface AnnouncerRangeDateSelectedState {
  multiselect: boolean;
  selectedDate:
    | Array<{ startDate?: DateFrameworkType; endDate?: DateFrameworkType }>
    | { startDate?: DateFrameworkType; endDate?: DateFrameworkType }
    | null;
}

export interface AnnouncerSingleDateSelectedState {
  multiselect: boolean;
  selectedDate: DateFrameworkType | DateFrameworkType[] | null;
}

export type DateSelectionAnnouncerState =
  | AnnouncerSingleDateSelectedState
  | AnnouncerRangeDateSelectedState
  | AnnouncerVisibleMonthState
  | AnnouncerMinMaxFocusState;

export function createSingleSelectionAnnouncement(
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState,
  dateAdapter: SaltDateAdapter,
): string | undefined {
  switch (announcementType) {
    case "minFocusableDateExceeded":
      return "cannot focus before minimum date";
    case "maxFocusableDateExceeded":
      return "cannot focus beyond maximum date";
    case "dateSelected": {
      const { multiselect, selectedDate } =
        state as AnnouncerSingleDateSelectedState;
      if (
        !selectedDate ||
        (multiselect && Array.isArray(selectedDate) && !selectedDate.length)
      ) {
        return "cleared date selection";
      }
      if (multiselect && Array.isArray(selectedDate)) {
        const lastSelectedDate = selectedDate[selectedDate.length - 1];
        return `${dateAdapter.format(lastSelectedDate, "dddd D MMMM YYYY")}, selected, ${selectedDate.length} dates in selection`;
      }
      if (!multiselect && selectedDate) {
        return `${dateAdapter.format(selectedDate as DateFrameworkType, "dddd D MMMM YYYY")}, selected`;
      }
      break;
    }
    case "visibleMonthChanged": {
      const { startVisibleMonth, endVisibleMonth } =
        state as AnnouncerVisibleMonthState;
      const isSingleMonth = dateAdapter.isSame(
        startVisibleMonth,
        endVisibleMonth,
        "month",
      );
      if (isSingleMonth) {
        return `${dateAdapter.format(startVisibleMonth, "MMMM YYYY")}.`;
      }
      return `${dateAdapter.format(startVisibleMonth, "MMMM YYYY")} and ${dateAdapter.format(endVisibleMonth, "MMMM YYYY")}.`;
    }
  }
}

export function createRangeSelectionAnnouncement(
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState,
  dateAdapter: SaltDateAdapter,
): string | undefined {
  switch (announcementType) {
    case "minFocusableDateExceeded":
      return "cannot focus before minimum date";
    case "maxFocusableDateExceeded":
      return "cannot focus beyond maximum date";
    case "dateSelected": {
      const { multiselect, selectedDate } =
        state as AnnouncerRangeDateSelectedState;
      if (
        !selectedDate ||
        (multiselect && Array.isArray(selectedDate) && !selectedDate.length)
      ) {
        return "cleared date selection";
      }
      let startDate: DateFrameworkType | null | undefined;
      let endDate: DateFrameworkType | null | undefined;
      if (multiselect && Array.isArray(selectedDate)) {
        const last = selectedDate[selectedDate.length - 1];
        startDate = last.startDate;
        endDate = last.endDate;
      } else if (
        !multiselect &&
        selectedDate &&
        typeof selectedDate === "object"
      ) {
        const range = selectedDate as {
          startDate?: DateFrameworkType | null;
          endDate?: DateFrameworkType | null;
        };
        startDate = range.startDate;
        endDate = range.endDate;
      }
      if (startDate && !endDate) {
        return "Select end date.";
      }
      if (!startDate && endDate) {
        return "Select start date.";
      }
      if (startDate && endDate) {
        const multiselectSuffix =
          multiselect && Array.isArray(selectedDate)
            ? `, ${selectedDate.length > 1 ? `${selectedDate.length} date ranges in selection` : ""}`
            : "";
        return `Date range ${dateAdapter.format(startDate, "dddd D MMMM YYYY")} to ${dateAdapter.format(endDate, "dddd D MMMM YYYY")}, selected${multiselectSuffix}`;
      }
      break;
    }
    case "visibleMonthChanged": {
      const { startVisibleMonth, endVisibleMonth } =
        state as AnnouncerVisibleMonthState;
      const isSingleMonth = dateAdapter.isSame(
        startVisibleMonth,
        endVisibleMonth,
        "month",
      );
      if (isSingleMonth) {
        return `${dateAdapter.format(startVisibleMonth, "MMMM YYYY")}.`;
      }
      return `${dateAdapter.format(startVisibleMonth, "MMMM YYYY")} and ${dateAdapter.format(endVisibleMonth, "MMMM YYYY")}.`;
    }
  }
}
