import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  type AnnouncementType,
  type AnnouncerRangeDateSelectedState,
  type AnnouncerSingleDateSelectedState,
  createRangeSelectionAnnouncement,
  createSingleSelectionAnnouncement,
  type DateSelectionAnnouncerState,
} from "../calendar/internal/createAnnouncement";
import { monthYearPanelMessages } from "./messages";

/**
 * Month-worded version of `createSingleSelectionAnnouncement`.
 * Pass it to the `DatePicker` `createAnnouncement` prop when the overlay
 * contains a `MonthYearSinglePanel`.
 */
export function createMonthYearSingleSelectionAnnouncement(
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState,
  dateAdapter: SaltDateAdapter,
): string | undefined {
  switch (announcementType) {
    case "dateSelected": {
      const { selectedDate } = state as AnnouncerSingleDateSelectedState;
      if (selectedDate && !Array.isArray(selectedDate)) {
        return monthYearPanelMessages.selectedAnnouncement(
          dateAdapter.format(selectedDate as DateFrameworkType, "MMMM YYYY"),
        );
      }
      break;
    }
  }
  return createSingleSelectionAnnouncement(
    announcementType,
    state,
    dateAdapter,
  );
}

/**
 * Month-worded version of `createRangeSelectionAnnouncement`.
 * Pass it to the `DatePicker` `createAnnouncement` prop when the overlay
 * contains a `MonthYearRangePanel`.
 */
export function createMonthYearRangeSelectionAnnouncement(
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState,
  dateAdapter: SaltDateAdapter,
): string | undefined {
  switch (announcementType) {
    case "dateSelected": {
      const { selectedDate } = state as AnnouncerRangeDateSelectedState;
      if (selectedDate && !Array.isArray(selectedDate)) {
        const { startDate, endDate } = selectedDate;
        if (startDate && !endDate) {
          // MonthYearRangePanel prompts for the end month itself, after the
          // picked month's updated label has been read.
          return undefined;
        }
        if (!startDate && endDate) {
          return monthYearPanelMessages.selectStartDate;
        }
        if (startDate && endDate) {
          return monthYearPanelMessages.selectedRangeAnnouncement(
            dateAdapter.format(startDate, "MMMM YYYY"),
            dateAdapter.format(endDate, "MMMM YYYY"),
          );
        }
      }
      break;
    }
  }
  return createRangeSelectionAnnouncement(announcementType, state, dateAdapter);
}
