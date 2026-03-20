import { type AriaAttributes, createContext } from "react";

export type AnnounceFnOptions = {
  /**
   * Assertiveness
   */
  ariaLive?: Exclude<AriaAttributes["aria-live"], "off">;
  /**
   * How long (ms) the announcement should remain in the DOM before being removed.
   * Defaults to the provider's ANNOUNCEMENT_TIME_IN_DOM.
   */
  duration?: number;
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
