import { createContext } from "react";

export type AnnounceFnOptions = {
  duration?: number;
  ariaLive?: Omit<React.AriaAttributes["aria-live"], "off">;
};

export type AriaAnnouncer = {
  /**
   * TODO remove legacy `delay` arg (number) in favour of `options` (AnnounceFnOptions) as a breaking change
   */
  /**
   * Announcer function
   * @param announcement - announcement to queue for screenreader.
   * @param legacyDelayOrOptions, deprecated `delay` or `options` for announcement
   */
  announce: (
    announcement: string,
    legacyDelayOrOptions?: number | AnnounceFnOptions,
  ) => void;
};

export const AriaAnnouncerContext = createContext<AriaAnnouncer | undefined>(
  undefined,
);
