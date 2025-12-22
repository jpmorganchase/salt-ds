import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";

export type AnnouncementType =
  | "minFocusableDateExceeded"
  | "maxFocusableDateExceeded"
  | "dateSelected"
  | "visibleMonthChanged";

// State types for each announcement
export type AnnouncerMinMaxFocusState = {}; // No state needed

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
  state:
    | AnnouncerSingleDateSelectedState
    | AnnouncerVisibleMonthState
    | AnnouncerMinMaxFocusState,
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
        return `Visible month starts from ${dateAdapter.format(startVisibleMonth, "dddd D MMMM YYYY")}`;
      }
      const endOfMonth = dateAdapter.endOf(endVisibleMonth, "month");
      return `Visible months are from ${dateAdapter.format(startVisibleMonth, "dddd D MMMM YYYY")} to ${dateAdapter.format(endOfMonth, "dddd D MMMM YYYY")}`;
    }
  }
}

export function createRangeSelectionAnnouncement(
  announcementType: AnnouncementType,
  state:
    | AnnouncerRangeDateSelectedState
    | AnnouncerVisibleMonthState
    | AnnouncerMinMaxFocusState,
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
      let startDate: DateFrameworkType | undefined;
      let endDate: DateFrameworkType | undefined;
      if (multiselect && Array.isArray(selectedDate)) {
        const last = selectedDate[selectedDate.length - 1];
        startDate = last.startDate;
        endDate = last.endDate;
      } else if (
        !multiselect &&
        selectedDate &&
        typeof selectedDate === "object"
      ) {
        startDate = (selectedDate as any).startDate;
        endDate = (selectedDate as any).endDate;
      }
      if (startDate && !endDate) {
        return `Selected start date ${dateAdapter.format(startDate, "dddd D MMMM YYYY")}`;
      }
      if (!startDate && endDate) {
        return `${dateAdapter.format(endDate, "dddd D MMMM YYYY")}, selected as end date`;
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
        return `Visible month starts from ${dateAdapter.format(startVisibleMonth, "dddd D MMMM YYYY")}`;
      }
      const endOfMonth = dateAdapter.endOf(endVisibleMonth, "month");
      return `Visible months are from ${dateAdapter.format(startVisibleMonth, "dddd D MMMM YYYY")} to ${dateAdapter.format(endOfMonth, "dddd D MMMM YYYY")}`;
    }
  }
}
