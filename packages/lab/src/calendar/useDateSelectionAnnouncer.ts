import type {DateFrameworkType, SaltDateAdapter} from "@salt-ds/date-adapters";
import { useAriaAnnouncer } from "@salt-ds/core";
import {
  AnnouncementType,
  DateSelectionAnnouncerState
} from "./internal/createAnnouncement";

export type CreateAnnouncement<TDate extends DateFrameworkType> = (
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState<TDate>,
  dateAdapter: SaltDateAdapter<TDate>,
) => string | undefined;

export function useDateSelectionAnnouncer<TDate extends DateFrameworkType>(
  createAnnouncement: CreateAnnouncement<TDate> | null | undefined,
  dateAdapter: SaltDateAdapter<TDate>,
) {
  const { announce: saltAnnouncer } = useAriaAnnouncer();

  /**
   * Call this function with the announcement type and the state needed for that announcement.
   * Example:
   *   announce("dateSelected", { multiselect, selectedDate });
   *   announce("visibleMonthChanged", { startVisibleMonth, endVisibleMonth });
   */
  const announce = (
    announcementType: AnnouncementType,
    state?: DateSelectionAnnouncerState<TDate> | undefined,
  ) => {
    if (!createAnnouncement) {
      return;
    }
    const announcement = createAnnouncement(announcementType, state ?? {}, dateAdapter);
    console.log('....', announcement);

    if (announcement) {
      saltAnnouncer(announcement, { delay: 3000});
    }
  };

  return { announce };
}
