import type { AnnounceFnOptions } from "@salt-ds/core";
import { useAriaAnnouncer } from "@salt-ds/core";
import type { SaltDateAdapter } from "@salt-ds/date-adapters";
import { useCallback, useRef } from "react";
import type {
  AnnouncementType,
  DateSelectionAnnouncerState,
} from "./internal/createAnnouncement";

export type CreateAnnouncement = (
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState,
  dateAdapter: SaltDateAdapter,
) => string | undefined;

export interface DateSelectionAnnouncer {
  announce: (
    announcementType: AnnouncementType,
    state?: DateSelectionAnnouncerState,
    announceOptions?: AnnounceFnOptions,
  ) => void;
}

export function useDateSelectionAnnouncer(
  createAnnouncement: CreateAnnouncement | null | undefined,
  dateAdapter: SaltDateAdapter,
): DateSelectionAnnouncer {
  const { announce: saltAnnouncer } = useAriaAnnouncer();

  // Ensure the returned announce function always uses the latest inputs.
  const createAnnouncementRef = useRef(createAnnouncement);
  createAnnouncementRef.current = createAnnouncement;

  const dateAdapterRef = useRef(dateAdapter);
  dateAdapterRef.current = dateAdapter;

  /**
   * Call this function with the announcement type and the state needed for that announcement.
   * Example:
   *   announce("dateSelected", { multiselect, selectedDate });
   *   announce("visibleMonthChanged", { startVisibleMonth, endVisibleMonth });
   */
  const announce = useCallback(
    (
      announcementType: AnnouncementType,
      state?: DateSelectionAnnouncerState | undefined,
      announceOptions?: AnnounceFnOptions,
    ) => {
      const create = createAnnouncementRef.current;
      if (!create) {
        return;
      }
      const announcement = create(
        announcementType,
        state ?? {},
        dateAdapterRef.current,
      );

      if (announcement) {
        saltAnnouncer(announcement, announceOptions);
      }
    },
    [saltAnnouncer],
  );

  return { announce };
}
