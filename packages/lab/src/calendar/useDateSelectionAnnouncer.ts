import { useAriaAnnouncer } from "@salt-ds/core";
import type { SaltDateAdapter } from "@salt-ds/date-adapters";
import { useEffect, useRef } from "react";
import type {
  AnnouncementType,
  DateSelectionAnnouncerState,
} from "./internal/createAnnouncement";

export type CreateAnnouncement = (
  announcementType: AnnouncementType,
  state: DateSelectionAnnouncerState,
  dateAdapter: SaltDateAdapter,
) => string | undefined;

const DEBOUNCE_MSECS = 2000;

export function useDateSelectionAnnouncer(
  createAnnouncement: CreateAnnouncement | null | undefined,
  dateAdapter: SaltDateAdapter,
) {
  const { announce: saltAnnouncer } = useAriaAnnouncer();

  const latestAnnouncementRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Call this function with the announcement type and the state needed for that announcement.
   * Example:
   *   announce("dateSelected", { multiselect, selectedDate });
   *   announce("visibleMonthChanged", { startVisibleMonth, endVisibleMonth });
   */
  const announce = (
    announcementType: AnnouncementType,
    state?: DateSelectionAnnouncerState | undefined,
  ) => {
    if (!createAnnouncement) {
      return;
    }
    const announcement = createAnnouncement(
      announcementType,
      state ?? {},
      dateAdapter,
    );

    if (announcement) {
      latestAnnouncementRef.current = announcement;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (latestAnnouncementRef.current) {
          saltAnnouncer(latestAnnouncementRef.current);
          latestAnnouncementRef.current = null;
        }
      }, DEBOUNCE_MSECS);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { announce };
}
